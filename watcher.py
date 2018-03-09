import subprocess
import time
import threading
import csv
import os
from pymouse import PyMouse

_setting = {
    "away_time": 300,  # 5 minutes
    "notify_user": 1800  # 30 minutes
}

timer = {}
file_name = "timesheet_%s.csv" % time.strftime("%d-%m-%Y %H-%M-%S")

away_time = 0;
_last_x = 0
_last_y = 0
_mouse = PyMouse()
global_secs = 0


def write_to_file():
    global timer, file_name

    writer = csv.writer(open(file_name, 'wb'))
    for key, value in timer.items():
        writer.writerow([key, value['secs'], value['date']])

    return


def print_to_screen():
    global timer

    subprocess.call('clear')

    for key, value in timer.items():
        print("{} : {}".format(value['secs'], key))

    return


def record_windows(winTitle):
    global timer, _mouse, _last_x, _last_y, away_time, _setting, global_secs

    _t = 1
    current_location = _mouse.position()

    # If mouse is ideal for more then X minutes
    if _last_x == current_location[0] and _last_y == current_location[1]:
        away_time = away_time + 1 # Possiblity of away

        if away_time == _setting['away_time']:  # If its away for x minutes
            timer[winTitle]['secs'] = timer[winTitle]['secs'] - _setting['away_time']
            winTitle = "Away Time"
            _t = _setting['away_time']
            away_time = 0
    else:
        away_time = 0

    timer.setdefault(winTitle, {})
    timer[winTitle].setdefault('secs', 0)
    timer[winTitle].setdefault('date', time.strftime("%d-%m-%Y"))

    timer[winTitle]['secs'] = timer[winTitle]['secs'] + _t

    if winTitle != 'Away Time':
        global_secs = global_secs + _t
        if global_secs % _setting['notify_user'] == 0:
            subprocess.Popen(['notify-send', 'You just passed %d minutes lap' % (global_secs/60)])


    # Write to file
    t = threading.Thread(name='FileWriter', target=write_to_file)
    t.start()

    # Print to screen
    print_to_screen()

    _last_x = current_location[0]
    _last_y = current_location[1]

    return

while True:
    try:
        window_title = subprocess.check_output('xdotool getactivewindow getwindowname', shell=True).replace(os.linesep, '')
        t = threading.Thread(name=window_title, target=record_windows, args=(window_title,))
        t.start()
        time.sleep(1)
    except:
        m, s = divmod(global_secs, 60)
        h, m = divmod(m, 60)
        subprocess.Popen(['notify-send', 'Watcher has been stopped'])
        subprocess.call('clear')
        exit()
