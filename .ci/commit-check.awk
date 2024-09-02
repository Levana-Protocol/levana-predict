$0 !~ /(.*@levana\.exchange$)|(noreply@github\.com$)|(.*@users\.noreply\.github\.com$)/ { print "Invalid email found in your git commit: " $0; exit 1 }
