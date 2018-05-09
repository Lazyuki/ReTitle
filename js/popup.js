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

  // So that the enter key submits and doesn't create newline.
  $("#title").keypress(function (e) {
    if(e.which == 13 && !e.shiftKey) {        
        $('#form').submit();
        e.preventDefault();
        return false;
    }
  });

  // Set link to the options page
  $('#gear').on('click', () => chrome.runtime.openOptionsPage(() => window.close()));

  // Set placeholder 
  // $('#title').attr('placeholder', currentTab.title);

  // Set previous title
  $('small').text('Old Title: ' + currentTab.title);
  $('small').click(() => {
    $('#title').val(currentTab.title);
    M.textareaAutoResize($('#title')); // resize text area
    $('#title').focus();
    $('#title').select();
  });

  $('.tooltipped').tooltip({enterDelay:200, margin:2, inDuration: 150, outDuration: 150, transitionMovement:5});

  // focus (for firefox) Fixed in nightly build
  setTimeout(() => {
    $('#title').focus();
  }, 100);

  // Search from bookmarks
  try {
      chrome.bookmarks.search({url:currentTab.url}, function (results) {
      if (results && results[0]) {
        $('#fromBookmark').text(`From bookmark: ${results[0].title}`);
        $('#fromBookmark').click(() => {
          $('#title').val(results[0].title);
          M.textareaAutoResize($('#title')); // resize text area
          $('#title').focus();
          $('#title').select();
        });
      }
    });
  } catch (e) {
    // URL not allowed;
    
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
