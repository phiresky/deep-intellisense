cp allcode.txt{,.bck}
# convert to ascii
iconv -f utf-8 -t ascii//TRANSLIT allcode.txt -o allcode.txt.ascii
# remove control characters except \t and \n
tr -d '\000-\010\013\014\016-\037' < allcode.txt.ascii > allcode.txt.ascii.clean
cp allcode.txt.ascii.clean allcode.txt
