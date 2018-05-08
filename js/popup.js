const radios = $(':radio');
const onetime = radios.eq(0);
const tablock = radios.eq(1);
const exact = radios.eq(2);
const domain = radios.eq(3);
const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/; 

let currentTab;

function initialize(tabs) {
  currentTab = tabs[0];
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

  // Add form listener for new titles
  $('#form').on('submit', function(e) {
    e.preventDefault();
    let newTitle = $('#title').val();
    chrome.runtime.sendMessage( // change Title
      { 
        id: currentTab.id,
        url: currentTab.url,
        oldTitle: currentTab.title,
        newTitle: newTitle
      }
    );
    saveTitle(
      newTitle,
      domain.is(':checked'),
      onetime.is(':checked'),
      tablock.is(':checked'),
      exact.is(':checked')
    );
  });

  // Set link to the options page
  $('#gear').on('click', () => chrome.runtime.openOptionsPage(() => window.close()));

  // Set placeholder 
  $('#title').attr('placeholder', currentTab.title);

  // Set previous title
  $('small').text('Old Title: ' + currentTab.title);
  $('small').click(() => {
    $('#title').attr('value', currentTab.title);
    $('#title').focus();
    $('#title').select();
  });

  $('.tooltipped').tooltip({enterDelay:100, margin:2, inDuration: 150, outDuration: 150});

  // focus (for firefox)
  setTimeout(() => {
    $('#title').focus();
  }, 100);

  // Search from bookmarks
  try {
      chrome.bookmarks.search({url:currentTab.url}, function (results) {
      if (results) {
        $('#fromBookmark').text(`From bookmark: ${results[0].title}`);
        $('#fromBookmark').click(() => {
          $('#title').attr('value', results[0].title);
          $('#title').focus();
          $('#title').select();
        });
      }
    });
  } catch (e) {
    // URL not allowed;
    console.log(e.message);
  }
}

function saveTitle(newTitle, domain, onetime, tablock, exact) {
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
  if (url.endsWith('/')) url = url.slice(0, -1);
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


// Popup opens.
// Get the current tab and do stuff.
chrome.tabs.query({
  active: true,
  currentWindow: true
}, initialize);
