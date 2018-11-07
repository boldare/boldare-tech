---
title: How to write a Phing target autocomplete bash script
subTitle: Improved solution with multiple imported XML build files support
cover: /img/bash.svg
tags:
  - PHP
  - Phing
  - bash
  - autocomplete
  - regex
postAuthor: Przemek Pawlas
---
## Issue

As someone working in a PHP project with lots of console commands I'm using
Phing. The tool itself heavily improves your efficiency by providing 
a configuration layer that simplifies calling those commands, e.g. you can
create a build target that sets up your production environment - runs DB
migrations, reindexes ElasticSearch, clears cache, etc.

But that wasn't sufficient for me. Since the number of commands is very high
and some of the names are very similar, `TAB` autocomplete became unavoidable for me - there was too much to remember and type without running a list
target. And of course a readable list required scrolling.

So I found some scripts and they worked fine for me at first. However, after
splitting large `build.xml` file into several ones, no script I could find
could handle imported files.

## Solution

I reworked [this](https://gist.github.com/krymen/4124392) script to work with imported XML files:

```bash
_phing () {
    local cur prev

    COMPREPLY=()
    
    # Absolute path to the main file with XML syntax, for other formats you need to modify the regexes
    buildfile=/app/build.xml

    [ ! -f $buildfile ] && return 0
    
    # Make formatting more consistent for grep by replacing some characters
    formatted_buildfile=$(cat $buildfile | tr "'\t\n" "\"  ")

    # Keep track of autocomplete state
    _get_comp_words_by_ref cur prev

    # Read targets from the main file, name as the first param assumed   
    targets=$(grep -oP "<target\s+name=\"\K([^\"]*)" <<< "$formatted_buildfile" 2>/dev/null)

    # Read valid imported files and add targets from them to the space-separated wordlist. You could make this recursive in a function that echoes merged targets if needed
    while read -r line
    do
        [ ! -f $line ] && continue

        file_targets=$(grep -oP "<target\s+name=\"\K([^\"]*)" <<< "$(cat $line | tr "'\t\n" "\"  ")" 2>/dev/null)
        targets+=" $file_targets"
    done < <(grep -oP "<import\s+file=\"\K([^\"]*)" <<< "$formatted_buildfile" 2>/dev/null)

    # For the specific wordlist generate output based on the current input    
    COMPREPLY=( $(compgen -W "$targets" -- "$cur") )
}

# Assign the autocomplete function to executables named phing
complete -F _phing phing
```

Simply place it in `/etc/bash_completion.d/` (directory that sources its files whenever you source `bash_completion`) as e.g. `phing` file and enjoy!
