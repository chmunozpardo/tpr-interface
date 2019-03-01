import sqlite3

import pymysql

import numpy as np
import datetime

conn = sqlite3.connect('db_back.sqlite3')
c = conn.cursor()

dbmysql = pymysql.connect('lixibit-db-test.clzt8nxas61h.us-east-2.rds.amazonaws.com',
                          'chmunozp',
                          'Lander159',
                          'lixidata')

cursor = dbmysql.cursor()

c.execute('SELECT * FROM processing_nodeaddress;')
names = [description[0] for description in c.description]
names = str(tuple(names)).replace("'","").replace('"', '')
print(names)
data_full = c.fetchall()
N = len(data_full)

for i in range(N):
    sql_query = 'INSERT INTO processing_nodeaddress '+names+' VALUES ' + str(data_full[i])
    print(sql_query)
    cursor.execute(sql_query)

c.execute('SELECT * FROM processing_datafield;')
names = [description[0] for description in c.description]
names = str(tuple(names)).replace("'","").replace('"', '')
print(names)
data_full = c.fetchall()
N = len(data_full)

for i in range(N):
    sql_query = 'INSERT INTO processing_datafield '+names+' VALUES ' + str(data_full[i])
    print(sql_query)
    cursor.execute(sql_query)

c.execute('SELECT * FROM processing_nodedata;')
names = [description[0] for description in c.description]
names = str(tuple(names)).replace("'","").replace('"', '')
print(names)
data_full = c.fetchall()
N = len(data_full)

for i in range(N):
    sql_query = 'INSERT INTO processing_nodedata '+names+' VALUES ' + str(data_full[i])
    print(sql_query)
    cursor.execute(sql_query)

dbmysql.commit()

# execute SQL query using execute() method.

# Fetch a single row using fetchone() method.
# disconnect from server
dbmysql.close()
conn.close()


# x = []
# y = []
# z = []
# w = []
# u = []
# v = []
# accx = []
# accy = []
# accz = []

# c.execute(
#         'SELECT id, updatetime_value_id FROM processing_nodedata;'
# )
# tmp = list(zip(*c.fetchall()))
# x = np.asarray(tmp[0])
# y = np.asarray(tmp[1])

# for i in range(len(x)):
# 	if y[i] is not None:
# 		c.execute(
# 			'SELECT update_time FROM processing_datafield WHERE id=?;', (y[i],)
# 		)
# 		tmp = np.asarray(list(zip(*c.fetchall())))
# 		sql = 'UPDATE processing_nodedata SET datatime=\'' + str(tmp[0][0]) + '\' WHERE id=' + str(x[i]) + ';'
# 		print(sql)
# 		c.execute(sql)
# 		conn.commit()
