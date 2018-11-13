const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/; 
let radios = $(':radio');
let checks = $(':checkbox');
const onetime = radios.eq(0);
const tablock = radios.eq(1);
const exact = radios.eq(2);
const domain = radios.eq(3);

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

// Materialize initializers
$('.tabs').tabs();
$('.collapsible').collapsible();

// Save default options
$('#save').on('click', function(e) {
  e.preventDefault();
  let options = {
    domain: domain.is(':checked'),
    onetime: onetime.is(':checked'),
    tablock: tablock.is(':checked'),
    exact: exact.is(':checked')
  }
  chrome.storage.sync.set({options:options});
  $('#check').css('display', 'inline-block').delay(1000).fadeOut(300);
});

// Open keyboard shortcut settings page
$('#keyboard').on('click', function() {
  chrome.tabs.create({url: "chrome://extensions/shortcuts"});
})

// So that the enter key submits and doesn't create newline.
$("#urlPattern").keypress(function (e) {
if(e.which == 13 && !e.shiftKey) {        
    $('#newTitle').focus().select();
    e.preventDefault();
    return false;
}
});

// So that the enter key submits and doesn't create newline.
$("#newTitle").keypress(function (e) {
  if(e.which == 13 && !e.shiftKey) {        
      $('#add').click();
      e.preventDefault();
      return false;
  }
});

// Add form listener for new titles
$('#add').on('click', function(e) {
  e.preventDefault();
  let urlPattern = $('#urlPattern').val().trim();
  let newTitle = $('#newTitle').val();
  if (/^\*.+\*$/.test(urlPattern)) {
    $('#urlPattern').addClass('valid').removeClass('invalid');
  } else {
    $('#urlPattern').addClass('invalid').removeClass('valid').focus();
    return;
  }
  let obj = {};
  obj[urlPattern] = {title:newTitle};
  chrome.storage.sync.set(obj);
  $('#added').css('display', 'inline-block').delay(1000).fadeOut(300);
});


// Show saved titles
let setTitleList = (function f() {
  let ul = $('.collection').eq(0);
  chrome.storage.sync.get(function (items) {
    for (let url in items) {
      if (url == 'options') continue;
      let li = $('<li></li>').attr('id', url)
      let href = url;
      if (url.startsWith('*') || url.startsWith('Tab#')) {
        href = '#';
      }
      let a = $('<a></a>').attr('href', href).text(url);
      if (url.startsWith('Tab#')) {
        a.click(
          () => chrome.tabs.update(parseInt(url.replace('Tab#', '')), { 'active' : true })
        );
      }
      let text = $('<span></span>').attr('class', 'editable-content').text(items[url]['title']);
      text.click(() => {
        let original = text.text();
        if ($('#edit-input').length) {
          $('#edit-input').eq(0).remove();
        } 
        // text.text('');
        let newTitleInput = $('<textarea />')
          .attr('class', 'materialize-textarea')
          .attr('id',  'edit-input')
          .val(original)
          .keypress(function (e) {
            if(e.which == 13 && !e.shiftKey) {        
                e.preventDefault();
                const newTitle = e.target.value;
                if (newTitle && newTitle !== original) {
                  const editedTitle = {}
                  editedTitle[url] = { title: newTitle };
                  chrome.storage.sync.set(editedTitle);
                } 
                $('#edit-input').eq(0).remove();
                return false;
            }
          })
        li.append(newTitleInput);
        newTitleInput.select()
        .focus();
      
      })

      let rm = $('<span></span>').attr('class', 'secondary-content');
      rm.append($('<i class="material-icons red-icon">delete</i>'));
      rm.on('click', function(e) {
        e.preventDefault();
        chrome.storage.sync.remove(url);
        $('#' + $.escapeSelector(`${url}`)).remove();
      });
      ul.append(li.append(a, text, rm))
    }
  });
  return f;
})();

// When the list is updated, update the view automatically
chrome.storage.onChanged.addListener(() => {
  $('.collection').empty();
  setTitleList();
});
