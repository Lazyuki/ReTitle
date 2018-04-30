//const REGEX_DOMAIN = /https?:\/\/(?:[^\s/]*\.)?([^./\s]+\.[a-z]+)(?:$|\/.*)/;
const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/;
const radios = $(':radio');
const domain = radios.eq(0);
const onetime = radios.eq(1);
const tablock = radios.eq(2);
const exact = radios.eq(3);

let currentTab;

function rename(newTitle, domain, onetime, tablock, exact) {
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
    let obj = {};
    let id = currentTab.id;
    obj[`Tab#${id}`] = {title:newTitle};
    chrome.storage.sync.set(obj, () => window.close());
  } else if (!onetime) {
    setStorage(newTitle, domain);
  }
  window.close();
}

function setStorage(title, domain) {
  let url = currentTab.url;
  let obj = {};
  if (domain) { // only for domain
    let match = url.match(REGEX_DOMAIN);
    if (!match) return; // Not valid domain, e.g. local files
    let urlDomain = match[1]
    obj[`*${urlDomain}*`] = {title:title};
  } else { // is exact
    obj[url] = {title:title};
  }
  chrome.storage.sync.set(obj, () => window.close());
}

// Get current tab, then do stuff
chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  currentTab = tabs[0];
  $('#form').on('submit', function(e) {
    e.preventDefault();
    rename(
      $('#title').val(),
      domain.is(':checked'),
      onetime.is(':checked'),
      tablock.is(':checked'),
      exact.is(':checked'));
  });

  // Set default checkboxes
  chrome.storage.sync.get('options', (items) => {
    if (items['options']) {
      let options = items['options'];
      if (options.domain) domain.prop('checked', true);
      if (options.onetime) onetime.prop('checked', true);
      if (options.tablock) tablock.prop('checked', true);
      if (options.exact) exact.prop('checked', true);
    } else {
      onetime.prop("checked", true);
    }
  })

  // Set link to the options page
  $('#gear').on('click', () => chrome.runtime.openOptionsPage());

  // Set placeholder 
  $('#title').attr('placeholder', currentTab.title);

  // Set previous title
  $('small').text(currentTab.title);

  // focus (for firefox)
  setTimeout(() => {
    $('#title').focus();
  }, 100);
});
