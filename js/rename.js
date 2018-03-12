const REGEX_DOMAIN = /https?:\/\/(?:[^\s/]*\.)?([^./\s]+\.[a-z]+)(?:$|\/.*)/;

function rename(newTitle, domain, onetime, tablock) {
  if (newTitle == '') return;
  chrome.tabs.executeScript(null,
    {code:`
      if (document.title) {
        document.title='${newTitle}';
      } else {
        let t = document.createElement('title');
        t.appendChild(document.createTextNode('${newTitle}'));
        if (document.head) {
          var h = document.getElementsByTagName('head')[0];
        } else {
          var h = document.createElement('head');
          let d = document.documentElement;
          d.insertBefore(h, d.firstChild);
        }
        h.appendChild(t)
      }`
    });
  if (tablock) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      let obj = {};
      let id = tabs[0].id;
      obj[`#${id}`] = {title:newTitle};
      chrome.storage.sync.set(obj, () => window.close());
    });
  } else if (!onetime) {
    setStorage(newTitle, domain);
  }
  window.close();
}

function setStorage(title, domain) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    let obj = {};
    let url = tabs[0].url;
    if (domain) { // only for domain
      let match = url.match(REGEX_DOMAIN);
      if (!match) return; // Not valid domain, e.g. local files
      let urlDomain = match[1]
      obj[`*${urlDomain}*`] = {title:title};
    } else {
      obj[url] = {title:title};
    }
    chrome.storage.sync.set(obj, () => window.close());
  })
}

let radios = $(':radio');
let domain = radios.eq(0);
let onetime = radios.eq(1);
let tablock = radios.eq(2);
let exact = radios.eq(3);
$('#form').on('submit', function(e) {
  e.preventDefault();
  rename(
    $('#title').val(),
    domain.is(':checked'),
    onetime.is(':checked'),
    tablock.is(':checked'));
});

// Set link to the options page
$('#gear').on('click', () => chrome.runtime.openOptionsPage());

// Set default checkboxes
chrome.storage.sync.get('options', (items) => {
  if (items['options']) {
    let options = items['options'];
    if (options.domain) domain.prop("checked", true);
    if (options.onetime) onetime.prop("checked", true);
    if (options.tablock) tablock.prop("checked", true);
  } else {
    domain.prop("checked", true);
  }
})
