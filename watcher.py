import subprocess
import time
import threading
import csv
import os

timer = {}
file_name = "timesheet_%s.csv"%time.time()

def write_to_file():
	global timer, file_name

	writer = csv.writer(open(file_name, 'wb'))
	for key, value in timer.items():
   		writer.writerow([key, value])

   	return

def print_to_screen():
	global timer

	subprocess.call('clear')

	for key, value in timer.items():
   		print "%s : %s" % (value, key)

   	return

def record_windows(winTitle):
	global timer

	timer.setdefault(winTitle, 0)
	timer[winTitle] = timer[winTitle] + 1

	t = threading.Thread(name='FileWriter', target=write_to_file)
	t.start()

	print_to_screen()

	return

while True:
	window_title = subprocess.check_output('xdotool getactivewindow getwindowname', shell=True).replace(os.linesep, '')	
	t = threading.Thread(name=window_title, target=record_windows, args=(window_title,))
	t.start()
	time.sleep(1)