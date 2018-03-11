let domain = document.getElementById('domain');
let onetime = document.getElementById('onetime'); 
let tablock = document.getElementById('tablock');
// Set default checkboxes
chrome.storage.sync.get('options', (items) => {
  if (items['options']) {
    let options = items['options'];
    if (options.domain) domain.checked = true;
    if (options.onetime) onetime.checked = true;
    if (options.tablock) tablock.checked = true;
  } else {
    domain.checked = true; // Default
  }
});
// Saves the option
document.getElementById('save').addEventListener('click', function(e) {
    e.preventDefault();
    let options = {domain:domain.checked,
                   onetime:onetime.checked,
                   tablock:tablock.checked};
    chrome.storage.sync.set({options:options})
  }
);

// Show saved titles
let ul = document.getElementsByTagName('ul')[0];
chrome.storage.sync.get(function (items) {
  for (let url in items) {
    if (url == 'options') continue;
    let li = document.createElement('li');
    let a = document.createElement('a');
    if (!url.startsWith('*')) {
      a.href = url;
    } else {
      a.href = '#';
    }
    let rm = document.createElement('div');
    rm.className = 'btn';
    li.id = url;
    rm.addEventListener('click', function(e) {
      e.preventDefault();
      chrome.storage.sync.remove(url);
      document.getElementById(url).remove();
    });
    rm.appendChild(document.createTextNode('remove'));
    a.appendChild(document.createTextNode(url));
    li.appendChild(a);
    li.appendChild(document.createTextNode(`: ${items[url]['title']}`));
    li.appendChild(rm);
    ul.appendChild(li);
  }
});
