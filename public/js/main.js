const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.textContent = '🌓';
themeToggle.setAttribute('aria-label', 'Toggle theme');

let currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
});

document.body.appendChild(themeToggle);

const navLinks = document.querySelectorAll('a[href="/"], a[href="/reader"]');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    const isGoingToReader = href === '/reader';
    
    const column = document.querySelector('.column.animate__animated');
    if (column) {
      column.classList.remove('animate__fadeIn');
      column.classList.add('animate__animated', 'animate__fadeOut');
      
      setTimeout(() => {
        window.location.href = href;
      }, 150);
    } else {
      window.location.href = href;
    }
  });
});

const defaultTemplate = `Протокол «**{{PROTOCOL_NAME}}**»

Мое подсознание,

Эти инструкции установят протокол «**{{PROTOCOL_NAME}}**». С этого момента прошу использовать эту версию опротокола.

Протокол будет запускаться и выполнять свою работу путем произнесения ключевой фразы «**{{PROTOCOL_NAME}}** СТАРТ».

Ты выделишь отдельную область подсознания, в которой будет происходить работа, и сделаешь так, чтобы эта работа не мешало моему нормальному функционированию и благополучию.

В пункте «Материал для обработки» будет передан материал, к которому ты должно применить все процедуры, описанные в обработчике «Процедура обработки». Ты применишь ВСЕ инструкции, которые задекларированы в обработчике «Процедура обработки» к данному материалу без исключения и проведешь полную процедуру, описанную в обработчике, к этому материалу.

Материал для обработки:

{{MATERIAL}}

---

А также любого рода мысли, образы, страхи, боль, фантазии, раздражение, ненависть, жалость, злость и другие реакции, которые возникли при зачитывании этого материала, и поместишь найденный материал в этот пункт для дальнейшей обработки.

Данный механизм обработки деактивируется автоматически после того, как весь переданный материал будет обработан тобой.

Ты будешь делать всю процедуру максимально мягко, регулируя ресурсы на работу так, чтобы не допускать перегрузок. На осознанный уровень ты выведешь все необходимые инсайты, знания и опыт.

Всю работу по этой процедуре ты проведешь в течении 3 суток или менее с момента запуска обработки, вне зависимости от того, в каком состоянии я нахожусь. В конце процедуры ты расформируешь область подсознания, выделенную для работы, и вернешь всю выделенную энергию мне и ее владельцам.

Мое подсознание, я благодарю тебя за эту работу, и признателен тебе и уважаю тебя за то, что ты делаешь.`;

function getTemplate() {
  return localStorage.getItem('protocolTemplate') || defaultTemplate;
}

function saveTemplate(template) {
  localStorage.setItem('protocolTemplate', template);
}

function resetTemplate() {
  localStorage.removeItem('protocolTemplate');
  return defaultTemplate;
}

function generateProtocol(material, protocolName) {
  const template = getTemplate();
  const lines = material.split('\n').filter(line => line.trim());
  const formattedMaterial = lines.map(line => line.trim()).join('\n\n');
  
  return template
    .replace(/\{\{PROTOCOL_NAME\}\}/g, protocolName)
    .replace(/\{\{MATERIAL\}\}/g, formattedMaterial);
}

const templateModal = document.getElementById('template-modal');
const templateBtn = document.getElementById('template-btn');
const templateTextarea = document.getElementById('template-textarea');
const templateSave = document.getElementById('template-save');
const templateCancel = document.getElementById('template-cancel');
const templateReset = document.getElementById('template-reset');
const templateModalClose = document.getElementById('template-modal-close');

if (templateBtn && templateModal) {
  templateBtn.addEventListener('click', () => {
    templateTextarea.value = getTemplate();
    templateModal.classList.add('is-active');
  });
}

if (templateModalClose) {
  templateModalClose.addEventListener('click', () => {
    templateModal.classList.remove('is-active');
  });
}

if (templateCancel) {
  templateCancel.addEventListener('click', () => {
    templateModal.classList.remove('is-active');
  });
}

if (templateSave) {
  templateSave.addEventListener('click', () => {
    saveTemplate(templateTextarea.value);
    templateModal.classList.remove('is-active');
  });
}

if (templateReset) {
  templateReset.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите сбросить шаблон к значениям по умолчанию?')) {
      const defaultTpl = resetTemplate();
      templateTextarea.value = defaultTpl;
    }
  });
}

if (templateModal) {
  templateModal.querySelector('.modal-background')?.addEventListener('click', () => {
    templateModal.classList.remove('is-active');
  });
}

const generatorForm = document.getElementById('generator-form');
if (generatorForm) {
  generatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(generatorForm);
    const material = formData.get('material') || '';
    let protocolName = formData.get('protocolName') || '';
    protocolName = protocolName.trim() || '123';
    
    const protocol = generateProtocol(material, protocolName);
    
    const blob = new Blob([protocol], { type: 'text/markdown; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `Протокол_${protocolName}.md`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result;
      const formData = new FormData();
      const blob = new Blob([text], { type: 'text/markdown' });
      formData.append('file', blob, fileName);
      
      const html = await fetch('/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json());
      
      if (html.html && html.protocolName) {
        saveProtocol(fileName, html.html, html.protocolName);
      }
    };
    reader.readAsText(blob);
  });
}

const fileInput = document.getElementById('file-input');
const readerContent = document.getElementById('reader-content');
const readerPlaceholder = document.getElementById('reader-placeholder');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressContainer = document.getElementById('progress-container');
const protocolsPanel = document.getElementById('protocols-panel');
const protocolsPanelOverlay = document.getElementById('protocols-panel-overlay');
const protocolsPanelToggle = document.getElementById('protocols-panel-toggle');
const protocolsPanelClose = document.getElementById('protocols-panel-close');
const protocolsList = document.getElementById('protocols-list');
const referenceInfo = document.getElementById('reference-info');

let currentScrollHandler = null;
let currentProtocolName = null;

const fileName = document.getElementById('file-name');

function saveProtocol(fileName, content, protocolName) {
  const saved = JSON.parse(localStorage.getItem('savedProtocols') || '[]');
  const protocol = {
    id: Date.now(),
    fileName,
    content,
    protocolName,
    date: new Date().toISOString()
  };
  saved.push(protocol);
  if (saved.length > 50) {
    saved.shift();
  }
  localStorage.setItem('savedProtocols', JSON.stringify(saved));
  updateSavedProtocolsList();
  return protocol;
}

function updateSavedProtocolsList() {
  const saved = JSON.parse(localStorage.getItem('savedProtocols') || '[]');
  
  if (protocolsList) {
    protocolsList.innerHTML = '';
    
    if (saved.length === 0) {
      protocolsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет сохраненных протоколов</p>';
    } else {
      const currentProtocolId = parseInt(localStorage.getItem('lastProtocolId') || '0');
      saved.reverse().forEach(protocol => {
        const item = document.createElement('div');
        const isActive = protocol.id === currentProtocolId;
        item.className = `protocol-item ${isActive ? 'is-active' : ''}`;
        item.innerHTML = `
          <div class="protocol-item-info">
            <div class="protocol-item-name">${protocol.fileName}</div>
            ${protocol.protocolName ? `<div class="protocol-item-protocol">${protocol.protocolName}</div>` : ''}
          </div>
          <button class="protocol-item-delete" data-id="${protocol.id}" type="button">🗑️</button>
        `;
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('protocol-item-delete')) {
            loadProtocol(protocol.id);
            closeProtocolsPanel();
          }
        });
        protocolsList.appendChild(item);
      });
      
      document.querySelectorAll('#protocols-list .protocol-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'));
          deleteProtocol(id);
        });
      });
    }
  }
  
  const protocolsListLeft = document.getElementById('protocols-list-left');
  const currentProtocolId = parseInt(localStorage.getItem('lastProtocolId') || '0');
  
  if (protocolsListLeft) {
    protocolsListLeft.innerHTML = '';
    
    if (saved.length === 0) {
      protocolsListLeft.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem; font-size: 0.75rem;">Нет протоколов</p>';
    } else {
      saved.slice().reverse().slice(0, 5).forEach(protocol => {
        const item = document.createElement('div');
        const isActive = protocol.id === currentProtocolId;
        item.className = `protocol-item ${isActive ? 'is-active' : ''}`;
        item.innerHTML = `
          <div class="protocol-item-info">
            <div class="protocol-item-name">${protocol.fileName}</div>
            ${protocol.protocolName ? `<div class="protocol-item-protocol">${protocol.protocolName}</div>` : ''}
          </div>
          <button class="protocol-item-delete" data-id="${protocol.id}" type="button">🗑️</button>
        `;
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('protocol-item-delete')) {
            loadProtocol(protocol.id);
          }
        });
        protocolsListLeft.appendChild(item);
      });
      
      document.querySelectorAll('#protocols-list-left .protocol-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'));
          deleteProtocol(id);
        });
      });
    }
  }
}

function deleteProtocol(id) {
  const saved = JSON.parse(localStorage.getItem('savedProtocols') || '[]');
  const filtered = saved.filter(p => p.id !== id);
  localStorage.setItem('savedProtocols', JSON.stringify(filtered));
  
  const currentProtocolId = parseInt(localStorage.getItem('lastProtocolId') || '0');
  if (currentProtocolId === parseInt(id)) {
    if (readerContent) {
      readerContent.innerHTML = '';
    }
    if (currentProtocolName) {
      currentProtocolName = null;
    }
    localStorage.removeItem('lastProtocolId');
    updateReferenceInfo();
    updatePlaceholderVisibility();
  }
  
  updateSavedProtocolsList();
}

const placeholderEmojis = ['👀', '🤔', '🧠', '🎯'];

function updatePlaceholderVisibility() {
  if (!readerContent || !readerPlaceholder) return;
  const hasContent = readerContent.innerHTML.trim().length > 0;
  if (hasContent) {
    readerPlaceholder.style.display = 'none';
  } else {
    readerPlaceholder.style.display = 'flex';
    const iconElement = readerPlaceholder.querySelector('.reader-placeholder-icon');
    if (iconElement) {
      const randomEmoji = placeholderEmojis[Math.floor(Math.random() * placeholderEmojis.length)];
      iconElement.textContent = randomEmoji;
    }
  }
}

function loadProtocol(id) {
  const saved = JSON.parse(localStorage.getItem('savedProtocols') || '[]');
  const protocol = saved.find(p => p.id === parseInt(id));
  if (protocol) {
    readerContent.innerHTML = protocol.content;
    currentProtocolName = protocol.protocolName;
    updateReferenceInfo();
    localStorage.setItem('lastProtocolId', id);
    progressBar.style.setProperty('--progress', '0%');
    progressText.textContent = '0%';
    updateProgressVisibility();
    setupProgressTracking();
    applyFont();
    applyFontSize();
    updateSavedProtocolsList();
    updatePlaceholderVisibility();
  }
}

function updateReferenceInfo() {
  if (!referenceInfo || !currentProtocolName) {
    referenceInfo.style.display = 'none';
    return;
  }
  referenceInfo.innerHTML = `Произнесите <strong>«${currentProtocolName} СТАРТ»</strong> несколько раз для запуска протокола.`;
  referenceInfo.style.display = 'block';
}

function updateProgressVisibility() {
  const showProgressBar = localStorage.getItem('showProgressBar') !== 'false';
  const progressValue = parseFloat(progressBar.style.getPropertyValue('--progress') || '0');
  if (progressValue <= 0 || !showProgressBar) {
    progressContainer.style.display = 'none';
  } else {
    progressContainer.style.display = 'flex';
  }
}

const progressBarToggle = document.getElementById('progress-bar-toggle');
if (progressBarToggle) {
  const savedShowProgressBar = localStorage.getItem('showProgressBar');
  if (savedShowProgressBar === null) {
    progressBarToggle.checked = true;
    localStorage.setItem('showProgressBar', 'true');
  } else {
    progressBarToggle.checked = savedShowProgressBar === 'true';
  }
  
  progressBarToggle.addEventListener('change', (e) => {
    localStorage.setItem('showProgressBar', e.target.checked);
    updateProgressVisibility();
  });
  
  updateProgressVisibility();
}

function setupProgressTracking() {
  if (currentScrollHandler) {
    window.removeEventListener('scroll', currentScrollHandler);
  }

  const updateProgress = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    const progressValue = Math.min(100, Math.max(0, progress));
    progressBar.style.setProperty('--progress', `${progressValue}%`);
    if (progressText) {
      progressText.textContent = `${Math.round(progressValue)}%`;
    }
    updateProgressVisibility();
  };

  currentScrollHandler = updateProgress;
  window.addEventListener('scroll', currentScrollHandler);
  updateProgress();
}

const fontButtons = {
  'font-wix': 'Wix Madefor Display',
  'font-inter': 'Inter',
  'font-roboto': 'Roboto',
  'font-opensans': 'Open Sans',
  'font-times': 'Times New Roman',
  'font-system': 'system-ui'
};

function applyFont() {
  const savedFont = localStorage.getItem('readerFont') || 'Wix Madefor Display';
  if (readerContent) {
    readerContent.setAttribute('data-font', savedFont);
  }
}

function applyFontSize() {
  const savedSize = localStorage.getItem('readerFontSize') || '16';
  if (readerContent) {
    const sizeInPx = `${savedSize}px`;
    readerContent.style.setProperty('--reader-font-size', sizeInPx);
    readerContent.style.setProperty('font-size', sizeInPx, 'important');
    readerContent.setAttribute('data-font-size', savedSize);
    
    const allElements = readerContent.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.setProperty('font-size', 'inherit', 'important');
    });
  }
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  if (fontSizeSlider) {
    fontSizeSlider.value = savedSize;
  }
  if (fontSizeValue) {
    fontSizeValue.textContent = `${savedSize}px`;
  }
}

const fontSizeSlider = document.getElementById('font-size-slider');
if (fontSizeSlider) {
  fontSizeSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    if (readerContent) {
      const sizeInPx = `${size}px`;
      readerContent.style.setProperty('--reader-font-size', sizeInPx);
      readerContent.style.setProperty('font-size', sizeInPx, 'important');
      readerContent.setAttribute('data-font-size', size);
      
      const allElements = readerContent.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.setProperty('font-size', 'inherit', 'important');
      });
    }
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeValue) {
      fontSizeValue.textContent = `${size}px`;
    }
    localStorage.setItem('readerFontSize', size);
  });
}

function setFont(fontName) {
  localStorage.setItem('readerFont', fontName);
  applyFont();
  
  Object.keys(fontButtons).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      if (fontButtons[btnId] === fontName) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    }
  });
}

Object.keys(fontButtons).forEach(btnId => {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', () => {
      setFont(fontButtons[btnId]);
    });
  }
});

const leftPanel = document.getElementById('left-panel');
const leftPanelOverlay = document.getElementById('left-panel-overlay');
const leftPanelToggle = document.getElementById('left-panel-toggle-btn');
const leftPanelCollapse = document.getElementById('left-panel-collapse');

function toggleLeftPanelOverlay() {
  if (window.innerWidth <= 768) {
    if (leftPanel.classList.contains('is-collapsed')) {
      leftPanelOverlay.classList.remove('is-active');
    } else {
      leftPanelOverlay.classList.add('is-active');
    }
  } else {
    leftPanelOverlay.classList.remove('is-active');
  }
}

if (leftPanel) {
  leftPanel.classList.remove('is-collapsed');
  leftPanel.classList.remove('no-transition');
  if (leftPanelToggle) {
    leftPanelToggle.classList.remove('is-visible');
  }
  
  toggleLeftPanelOverlay();
  
  if (leftPanelToggle) {
    leftPanelToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      leftPanel.classList.remove('is-collapsed');
      leftPanelToggle.classList.remove('is-visible');
      toggleLeftPanelOverlay();
    });
  }
  
  if (leftPanelCollapse) {
    leftPanelCollapse.addEventListener('click', (e) => {
      e.stopPropagation();
      leftPanel.classList.add('is-collapsed');
      if (leftPanelToggle) {
        leftPanelToggle.classList.add('is-visible');
      }
      toggleLeftPanelOverlay();
    });
  }

  if (leftPanelOverlay) {
    leftPanelOverlay.addEventListener('click', () => {
      leftPanel.classList.add('is-collapsed');
      if (leftPanelToggle) {
        leftPanelToggle.classList.add('is-visible');
      }
      toggleLeftPanelOverlay();
    });
  }

  window.addEventListener('resize', () => {
    toggleLeftPanelOverlay();
  });
}

const savedFont = localStorage.getItem('readerFont') || 'Wix Madefor Display';
setFont(savedFont);
applyFont();
applyFontSize();

if (readerContent) {
  updatePlaceholderVisibility();
  const lastProtocolId = localStorage.getItem('lastProtocolId');
  if (lastProtocolId) {
    loadProtocol(parseInt(lastProtocolId));
  }
}

function openProtocolsPanel() {
  protocolsPanel.classList.add('is-open');
  if (protocolsPanelOverlay) {
    protocolsPanelOverlay.classList.add('is-active');
  }
  updateSavedProtocolsList();
}

function closeProtocolsPanel() {
  protocolsPanel.classList.remove('is-open');
  if (protocolsPanelOverlay) {
    protocolsPanelOverlay.classList.remove('is-active');
  }
}

if (protocolsPanelToggle) {
  protocolsPanelToggle.addEventListener('click', openProtocolsPanel);
}

if (protocolsPanelClose) {
  protocolsPanelClose.addEventListener('click', closeProtocolsPanel);
}

if (protocolsPanelOverlay) {
  protocolsPanelOverlay.addEventListener('click', closeProtocolsPanel);
}

updateSavedProtocolsList();

if (fileInput && readerContent && progressBar) {
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileName) {
      fileName.textContent = file.name;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      readerContent.innerHTML = data.html;
      currentProtocolName = data.protocolName;
      updateReferenceInfo();
      
      const savedProtocol = saveProtocol(file.name, data.html, data.protocolName);
      if (savedProtocol) {
        localStorage.setItem('lastProtocolId', savedProtocol.id);
      }

      applyFont();
      applyFontSize();
      progressBar.style.setProperty('--progress', '0%');
      if (progressText) {
        progressText.textContent = '0%';
      }
      updateProgressVisibility();
      updatePlaceholderVisibility();

      setupProgressTracking();
    } catch (error) {
      alert('Ошибка при загрузке файла');
    }
  });
}

