const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/; 
let radios = $(':radio');
let checks = $(':checkbox');
let domain = radios.eq(0);
let onetime = radios.eq(1);
let tablock = radios.eq(2);
let exact = radios.eq(3);

// Import from bookmarks
$('#importBookmarks').on('click', function() {
  // TODO: show alert about updating old names
  chrome.bookmarks.getTree((treeRoots) => {
    let obj = {};
    treeRoots.forEach((treeRoot) => {
      (function recurse(treeNode) {
        if (treeNode.children) { // is a folder
          treeNode.children.forEach((n) => {
            recurse(n);
          })
        } else { // is a bookmark
          if (treeNode.title != '') {
            obj[treeNode.url] = {title:treeNode.title}; // TODO imported:true? or confirmation window with a count
          }
        }
      }(treeRoot));
    })
    chrome.storage.sync.set(obj);
  });
})

$('#save').on('click', function(e) {
  e.preventDefault();
  let options = {
    domain:domain.is(':checked'),
    onetime:onetime.is(':checked'),
    tablock:tablock.is(':checked'),
    exact:exact.is(':checked')
  }
  chrome.storage.sync.set({options:options});
  $('#check').css('display', 'inline-block').delay(1000).fadeOut(300);
});


// Open keyboard shortcut settings page
$('#keyboard').on('click', function() {
  chrome.tabs.create({url: "chrome://extensions/shortcuts"});
});

// Set default checkboxes
chrome.storage.sync.get('options', (items) => {
  if (items['options']) {
    let options = items['options'];
    if (options.domain) domain.prop("checked", true);
    if (options.onetime) onetime.prop("checked", true);
    if (options.tablock) tablock.prop("checked", true);
    if (options.exact) exact.prop("checked", true);
  } else {
    onetime.prop("checked", true); // Default setting
  }
})


// Show saved titles
let setTitleList = (function f() {
  let ul = $('#savedTitles > ul').eq(0);
  chrome.storage.sync.get(function (items) {
    for (let url in items) {
      if (url == 'options') continue;
      let li = $('<li></li>').attr('id', url)
      let href = url;
      if (url.startsWith('*')) {
        href = '#';
      }
      let a = $('<a></a>').attr('href', href).text(url);
      let rm = $('<span></span>').attr('class', 'secondary-content');
      rm.append($('<i class="material-icons red-icon">delete</i>'))
      rm.on('click', function(e) {
        e.preventDefault();
        chrome.storage.sync.remove(url);
        $('#' + $.escapeSelector(`${url}`)).remove();
      });
      ul.append(li.append(a, `: ${items[url]['title']}`, rm))
    }
  });
  return f;
})();
// When the list is updated, update the view automatically
chrome.storage.onChanged.addListener(() => {
  $('#savedTitles > ul').empty();
  setTitleList();
});
