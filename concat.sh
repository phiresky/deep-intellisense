#!/usr/bin/zsh
set -eu
. `which env_parallel.zsh`
tmpfile=$(mktemp)
echo writing filelist to $tmpfile

cmd=(find repos/ -not -empty -type f \( -name '*.ts' -o -name '*.tsx' \) -a -not -name '*.d.ts' -a -not -name '*.d.tsx')

count=$($cmd | wc -l)

echo parsing $count files >&2

check_ts_file() {
	# Prettier outputs each formatted filename + the duration it took to format
	prettier --write --no-config --config $PRRC "$@" | while read line; do
		# will not print filenames that failed formatting
		echo "${line% *}" # remove duration
	done
}

rm -f allcode.txt

# loop over all generated Prettier configs
for prrc in rcs/*; do
	export PRRC=$prrc
	$cmd | pv -l -s $count | env_parallel --joblog ./jobs.log --keep-order --progress --bar -n100 check_ts_file > $tmpfile

	# concat all files separated via a line containing EOF
	cat $tmpfile | pv -l -s $count -cN files | sed '/^$/d' | while read fname; do
		cat $fname
		echo '// [EOF]'
	done | pv -cN size >> allcode.txt
done
