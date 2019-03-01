import sqlite3
import numpy as np
import datetime

conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()

x = []
y = []
z = []
w = []
u = []
v = []
accx = []
accy = []
accz = []

c.execute(
        'SELECT id, updatetime_value_id FROM processing_nodedata;'
)
tmp = list(zip(*c.fetchall()))
x = np.asarray(tmp[0])
y = np.asarray(tmp[1])

for i in range(len(x)):
	if y[i] is not None:
		c.execute(
			'SELECT update_time FROM processing_datafield WHERE id=?;', (y[i],)
		)
		tmp = np.asarray(list(zip(*c.fetchall())))
		sql = 'UPDATE processing_nodedata SET datatime=\'' + str(tmp[0][0]) + '\' WHERE id=' + str(x[i]) + ';'
		print(sql)
		c.execute(sql)
		conn.commit()
conn.close()
