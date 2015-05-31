import subprocess
import time
import threading
import csv
import os

_setting = {
	"away_time": 300 # 5 minute
}

timer = {}
file_name = "timesheet_%s.csv"%time.time()

away_time = 0;
last_task = "";

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
	global timer, last_task, away_time, _setting

	_t = 1

	# If task is same as previous
	if last_task == winTitle:
		away_time = away_time + 1 # Possiblity of away

		if away_time == _setting['away_time']: # If its away for 1 minute
			timer[winTitle] = timer[winTitle] - _setting['away_time']
			winTitle = "Away Time"
			_t = _setting['away_time']
			away_time = 0
	else:
		away_time = 0

	timer.setdefault(winTitle, 0)
	timer[winTitle] = timer[winTitle] + _t

	t = threading.Thread(name='FileWriter', target=write_to_file)
	t.start()

	print_to_screen()

	last_task = winTitle

	return

while True:
	window_title = subprocess.check_output('xdotool getactivewindow getwindowname', shell=True).replace(os.linesep, '')	
	t = threading.Thread(name=window_title, target=record_windows, args=(window_title,))
	t.start()
	time.sleep(1)