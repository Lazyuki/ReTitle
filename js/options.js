let radios = $(':radio');
let domain = radios.eq(0);
let onetime = radios.eq(1);
let tablock = radios.eq(2);
let exact = radios.eq(3);
$('#save').on('click', function(e) {
  e.preventDefault();
  let options = {
    domain:domain.is(':checked'),
    onetime:onetime.is(':checked'),
    tablock:tablock.is(':checked'),
    exact:exact.is(':checked')
  }
  chrome.storage.sync.set({options:options});
});


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

// Show saved titles
let ul = $('ul').eq(0);
chrome.storage.sync.get(function (items) {
  for (let url in items) {
    if (url == 'options') continue;
    let li = $('<li></li>').attr('id', url)
    href = url;
    if (url.startsWith('*')) {
      href = '#';
    }
    let a = $('<a></a>').attr('href', href).text(url);
    let rm = $('<span></span>').attr('class', 'secondary-content');
    rm.append($('<i class="material-icons">delete</i>'))
    rm.on('click', function(e) {
      e.preventDefault();
      chrome.storage.sync.remove(url);
      $('#' + $.escapeSelector(`${url}`)).remove();
    });
    ul.append(li.append(a, `: ${items[url]['title']}`, rm))
  }
});
