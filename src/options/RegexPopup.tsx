import { h } from 'preact';

const AdvancedSettings = () => {
  const regex101 =
    'https://regex101.com/?flavor=javascript&regex=reddit%5C.com%5C%2Fr%5C%2F(%5B%5E%2F%5D%2B)';
  return (
    <div id="advancedOptions" class="col s12">
      <ul class="collapsible">
        <li>
          <h3 class="collapsible-header">
            Regeular Expression (regex) Replacement
          </h3>
          <div>Regex is a powerful tool.</div>
          <div class="collapsible-body">
            <span>
              <br />
              <a href={regex101}>Regex 101</a>
              <br />
              The syntax is <br />
              <code>/regex/replacement/flags</code>
              <br />
              Notice that there are three forward slashes, so if you want to use
              a slash in regex or replacement, you need to escape it with a
              backward slash <code>\</code>.<br />
              In replacement, you can use regex's captured groups with
              <code>$1</code>, <code>$2</code> and so on.
              <br />
              Possible flags are "g" for global, and "i" for ignore case. Do not
              forget the last slash if not using any flags.
              <br />
              Examples:
              <br />
              <code>/.*/Lazy/</code> is the same as just setting the title to
              "Lazy".
              <br />
              <code>/(.*)/LAZ $1/</code> will replace "old title" to "LAZ old
              title".
              <br />
              <code>/(.*)/r\/$1/</code> will replace "Lazy" to "r/Lazy".
              <br />
              <code>/([a-z])/0$1/gi</code> will replace "sPonGe" to
              "0s0P0o0n0G0e"
              <br />
              <code>/f([^o]+)(.*)/FB $2$1/i</code> will replace "Facebook" to
              "FB ookaceb" (but why)
            </span>
          </div>
        </li>
        <li>
          <div class="collapsible-header">
            Beta Feature: Add Your Own URL Pattern
          </div>
          <div class="collapsible-body">
            <span>
              <h6>This feature may not work as expected!</h6>
              <br />
              Another beta feature that lets you create your own URL pattern
              match.
              <br />
              Note that regex matching has the lowest priority when searching
              for a URL match.
              <br />
              The URL pattern must start and end with an asterisk
              <code>*</code>
              <br />
              Instead of using $1, $2 to use capture groups, use ${1}, ${2}{' '}
              instead for URLs.
              <br />
              Examples: <br />
              <code>*reddit\.com/(r/[^/]+)* | Red ${1}</code> will change
              <code>https://www.reddit.com/r/funny</code> to
              <code>Red r/funny</code> It can be combined with the title regex
              mentioned above too.
              <br />
              <code>
                *\.([^.]+)\.com/(.*)* | /(.*)/${1} $1 ${2}/
              </code>
              will change <code>https://www.reddit.com/r/funny</code> to
              <code>reddit funny r/funny</code> <br />
              <br />
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default AdvancedSettings;
