import subprocess
import time
import threading
import csv
import os
from pymouse import PyMouse

_setting = {
	"away_time": 300 # 5 minute
}

timer = {}
file_name = "timesheet_%s.csv"%time.time()

away_time = 0;
_last_x = 0
_last_y = 0

_mouse = PyMouse()

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
	global timer, _mouse, _last_x, _last_y, away_time, _setting

	_t = 1
	current_location = _mouse.position()

	# If task is same as previous
	if _last_x == current_location[0] and _last_y == current_location[1]:
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

	_last_x = current_location[0]
	_last_y = current_location[1]

	return

while True:
	window_title = subprocess.check_output('xdotool getactivewindow getwindowname', shell=True).replace(os.linesep, '')	
	t = threading.Thread(name=window_title, target=record_windows, args=(window_title,))
	t.start()
	time.sleep(1)