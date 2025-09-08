# Практика №1
## Задание 1
```bash
grep -o "^[^:]*" /etc/passwd | sort
```

## Задание 2
```bash
tail -n 5 /etc/protocols | awk '{print $2, $1}' | sort -r -n
```

## Задание 3
```bash
nano custom_banner
```
В файле:
```bash
#!/bin/bash
param_length=${#1}
dashes_string="--"
for (( i = 0; i < ${param_length}; i++ )); do
	dashes_string+="-"
done
echo "+${dashes_string}+"
echo "| ${1} |"
echo "+${dashes_string}+"
```
Консоль:
```bash
chmod +x custom_banner
./custom_banner
```

## Задание 4
В файле print_ids:
```bash
#!/bin/bash
filename=$1
grep -oE "[a-zA-Z_]+" $filename | sort -u
```
Использование программы:
```bash
chmod +x print_ids
./print_ids hello.c
```

## Задание 5
Программа reg:
```bash
#!/bin/bash
chmod +x $1
cp $1 /usr/local/bin/
```
Использование программы:
```bash
chmod +x reg
sudo ./reg custom_banner
```

## Задание 6
Файл check_comment:
```bash
#!/bin/bash
file_name=$1
extension="${file_name##*.}"
if [ $extension = "py" ]; then
	if head -n 1 $file_name | grep -qE "#"; then
		echo "Comment in the file has been found!"
	else
		echo "Comment was not found"
	fi	
elif [ $extension = "c" -o $extension = "js" ]; then
	if head -n 1 $file_name | grep -qE "//"; then
		echo "Comment in the file has been found!"
	else
		echo "Comment was not found"
	fi
else
	echo "Invalid type of file"
fi
```
Использование программы:
```bash
chmod +x check_comment
./check_comment test_comment.py
```

## Задание 7



## Задание 8
В файле archive_files:
```bash
#!/bin/bash

directory=$1
extension=$2

archive_name="files_${extension}.tar"
find $directory -type f -name "*.$extension" | tar -cf "../$archive_name" -T -
```
Использование программы:
```bash
chmod +x archive_files
./archive_files test_files/ txt
```

## Задание 9
В файле do_tabulation:
```bash
#!/bin/bash
input_file=$1
output_file=$2
cat $input_file | sed 's/    /\t/g' >> $output_file
```
Использование программы:
```bash
chmod +x do_tabulation
./do_tabulation file_to_tabulate.txt tabulated.txt
```

## Задание 10
В файле check_empty:
```bash
#!/bin/bash
target_dir=$1
cd $target_dir
txt_files=(*.txt)
if [ -e "${txt_files[0]}" ]; then
    for file in "${txt_files[@]}"; do
        if [ ! -s "$file" ]; then
            echo "$file"
        fi
    done
fi
```
Использование команды:
```bash
chmod +x check_empty
./check_empty test_files/
```
