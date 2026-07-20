/**
 * Terminal App
 */
class TerminalApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.history = [];
    this.historyIndex = -1;
    this.currentDir = '/桌面';
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="terminal-content" id="terminal-${this.windowId}">
        <div class="terminal-output"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">$ </span>
          <input type="text" class="terminal-input" spellcheck="false" autocomplete="off">
        </div>
      </div>
    `;

    this.output = this.container.querySelector('.terminal-output');
    this.input = this.container.querySelector('.terminal-input');

    this.printLine('macOS Web Terminal v1.0');
    this.printLine('Type "help" for available commands.');
    this.printLine('');

    this.input.focus();
    this.setupEvents();
  }

  setupEvents() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = this.input.value.trim();
        if (command) {
          this.executeCommand(command);
          this.history.push(command);
          this.historyIndex = this.history.length;
        }
        this.input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      }
    });

    this.container.addEventListener('click', () => {
      this.input.focus();
    });
  }

  printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (className) line.classList.add(className);
    line.textContent = text;
    this.output.appendChild(line);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const term = this.container.querySelector(`#terminal-${this.windowId}`);
    if (term) term.scrollTop = term.scrollHeight;
  }

  executeCommand(command) {
    this.printLine(`$ ${command}`);

    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        this.printLine('可用命令:');
        this.printLine('  ls          列出文件');
        this.printLine('  cd <dir>    切换目录');
        this.printLine('  pwd         显示当前路径');
        this.printLine('  cat <file>  查看文件内容');
        this.printLine('  echo <text> 输出文本');
        this.printLine('  mkdir <dir> 创建目录');
        this.printLine('  rm <file>   删除文件');
        this.printLine('  touch <file> 创建文件');
        this.printLine('  clear       清屏');
        this.printLine('  date        显示日期');
        this.printLine('  whoami      显示用户名');
        this.printLine('  uname       系统信息');
        break;
      case 'ls':
        this.cmdLs(args[0] || this.currentDir);
        break;
      case 'cd':
        this.cmdCd(args[0] || '/');
        break;
      case 'pwd':
        this.printLine(this.currentDir);
        break;
      case 'cat':
        if (args[0]) this.cmdCat(args[0]);
        else this.printLine('cat: 缺少文件参数');
        break;
      case 'echo':
        this.printLine(args.join(' '));
        break;
      case 'mkdir':
        if (args[0]) {
          const path = this.resolvePath(args[0]);
          window.vfs.createFolder(path);
          this.printLine(`创建目录: ${args[0]}`);
        } else {
          this.printLine('mkdir: 缺少目录名');
        }
        break;
      case 'rm':
        if (args[0]) {
          const path = this.resolvePath(args[0]);
          window.vfs.deleteFile(path);
          this.printLine(`删除: ${args[0]}`);
        } else {
          this.printLine('rm: 缺少文件参数');
        }
        break;
      case 'touch':
        if (args[0]) {
          const path = this.resolvePath(args[0]);
          window.vfs.writeFile(path, '');
          this.printLine(`创建文件: ${args[0]}`);
        } else {
          this.printLine('touch: 缺少文件名');
        }
        break;
      case 'clear':
        this.output.innerHTML = '';
        break;
      case 'date':
        this.printLine(new Date().toLocaleString('zh-CN'));
        break;
      case 'whoami':
        this.printLine('user');
        break;
      case 'uname':
        this.printLine('macOS Web Desktop 1.0');
        break;
      case '':
        break;
      default:
        this.printLine(`zsh: command not found: ${cmd}`);
    }
  }

  resolvePath(path) {
    if (path.startsWith('/')) return path;
    if (path === '..') {
      const parts = this.currentDir.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }
    return this.currentDir + '/' + path;
  }

  cmdLs(path) {
    const resolved = this.resolvePath(path);
    const items = window.vfs.listDir(resolved);
    if (items.length === 0) {
      this.printLine('total 0');
      return;
    }
    items.forEach(item => {
      const prefix = item.type === 'folder' ? 'd' : '-';
      this.printLine(`${prefix}rwxrwxrwx  1 user  staff  ${(item.content || '').length}  ${new Date(item.modified).toLocaleDateString('zh-CN')}  ${item.name}`);
    });
  }

  cmdCd(path) {
    if (!path) path = '/';
    const resolved = this.resolvePath(path);
    const node = window.vfs.resolvePath(resolved);
    if (node && node.type === 'folder') {
      this.currentDir = resolved;
    } else {
      this.printLine(`cd: 不是目录: ${path}`);
    }
  }

  cmdCat(filename) {
    const resolved = this.resolvePath(filename);
    const content = window.vfs.readFile(resolved);
    if (content !== null) {
      this.printLine(content);
    } else {
      this.printLine(`cat: ${filename}: 没有那个文件`);
    }
  }

  onClose() {}
}
