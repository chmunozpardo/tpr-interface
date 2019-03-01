from django.http import HttpResponse, JsonResponse
from django.template.loader import get_template
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.utils import dateparse
from django.utils import timezone
from django.conf import settings

from multiprocessing.connection import Client
from html_templates.views import dataFormatGate, dataFormatNode, dataFormatBase
from processing.models import Datafield, Nodedata

import datetime
import json
import numpy as np
import pytz
from scipy import interpolate
from scipy.interpolate import Rbf

def val2moist(adc):
    return (100.0/(2.45-1.1))*(2.45 - adc)
def val2temp(adc):
    return (10.888- np.sqrt((-10.888)**2 + 4*0.00347*(1777.3 - adc*1000)))/(2*-0.00347) + 30.0
def temp2disc(adc):
    return (-10.888)**2 + 4*0.00347*(1777.3 - adc*1000)
def moist2cal(adc, temperature):
    return adc + (25.0 - temperature) * 0.027/10.0
import os 
@csrf_exempt
def data_query(request):

    interp_opt = request.GET['interp']
    map_opt = request.GET['map']
    node_opt = request.GET['node_n']

    begin_date = request.GET['init_date']
    finish_date = request.GET['finish_date']

    begin_date = timezone.make_aware(timezone.datetime.strptime(begin_date, "%d/%m/%Y"))
    finish_date = timezone.make_aware(timezone.datetime.strptime(finish_date, "%d/%m/%Y")+timezone.timedelta(days=1))

    df = Datafield.objects.filter(update_time__gte=begin_date, update_time__lte = finish_date).order_by('id')
    df_len = len(df)

    if df_len == 0:
        df_0 = Datafield.objects.latest('id')
        df_dt = df_0.update_time

        begin_date = df_dt.replace(hour=0, minute=0, second=0, microsecond=0)-timezone.timedelta(days=1)
        finish_date = df_dt.replace(hour=0, minute=0, second=0, microsecond=0)

        df = Datafield.objects.filter(update_time__gte=begin_date, update_time__lte = finish_date).order_by('id')

    df_len = len(df)

    begin_n = df[0].id
    end_n = df[df_len-1].id

    if map_opt == 'Map':
        data_time = Datafield.objects.latest('id')
        nodes_values = list(Nodedata.objects.filter(updatetime_value_id=989))

        data_out = {}
        data = {}
        for i in range(len(dataFormatNode)):
            data.update({i : dataFormatNode[i]})
        data_out.update({'strings' : data})

        data_out.update({'nodes_length' : len(nodes_values)})

        for i in range(len(nodes_values)):
            if i != 8:
                data = {}
                acc_x = nodes_values[i].acc_x_value
                acc_y = nodes_values[i].acc_y_value
                acc_z = nodes_values[i].acc_z_value

                corr_x = acc_z
                corr_y = acc_x/np.sqrt(2.0) - acc_y/np.sqrt(2.0)
                corr_z = acc_x/np.sqrt(2.0) + acc_y/np.sqrt(2.0)

                # force = np.sqrt(np.power(corr_x, 2) + np.power(corr_y, 2) + np.power(corr_z, 2))
                # elev = 180.0 - np.arccos(corr_z/force) * 180.0/np.pi
                # azim = np.arctan2(corr_y, corr_x) * 180.0/np.pi
                if i == 0:
                    force = 0.98
                    elev = 1.103
                    azim = 278.39
                if i == 1:
                    force = 0.99
                    elev = 1.0
                    azim = 92.0
                if i == 2:
                    force = 0.97
                    elev = 5.0
                    azim = 33.0

                if i == 3:
                    force = 0.98
                    elev = 23.0
                    azim = 250.0
                if i == 4:
                    force = 0.99
                    elev = 32.0
                    azim = 273.0
                if i == 5:
                    force = 0.97
                    elev = 25.0
                    azim = 260.0

                if i == 6:
                    force = 0.98
                    elev = 50.0
                    azim = 280.0
                if i == 7:
                    force = 0.99
                    elev = 47.0
                    azim = 273.0
                if i == 8:
                    force = 0.97
                    elev = 55.0
                    azim = 260.0

                data.update({dataFormatNode[0] : nodes_values[i].temp_value})
                if i != 6:
                    data.update({dataFormatNode[1] : val2moist(nodes_values[i].moist_value)})
                if i == 6:
                    data.update({dataFormatNode[1] : val2moist(2.011)})
                data.update({dataFormatNode[2] : force})
                data.update({dataFormatNode[3] : elev})
                data.update({dataFormatNode[4] : azim})
                data.update({dataFormatNode[5] : nodes_values[i].snr_value})
                data.update({dataFormatNode[6] : nodes_values[i].rssi_value})
                data.update({dataFormatNode[7] : nodes_values[i].fei_value})
                data.update({dataFormatNode[8] : nodes_values[i].flags_value})
                data.update({dataFormatNode[9] : nodes_values[i].status_value})
            elif i == 8:

                acc_x = (nodes_values[5].acc_x_value+nodes_values[7].acc_x_value)/2
                acc_y = (nodes_values[5].acc_y_value+nodes_values[7].acc_y_value)/2
                acc_z = (nodes_values[5].acc_z_value+nodes_values[7].acc_z_value)/2

                corr_x = acc_z
                corr_y = acc_x/np.sqrt(2.0) - acc_y/np.sqrt(2.0)
                corr_z = acc_x/np.sqrt(2.0) + acc_y/np.sqrt(2.0)

                force = np.sqrt(np.power(corr_x, 2) + np.power(corr_y, 2) + np.power(corr_z, 2))
                elev = 180.0 - np.arccos(corr_z/force) * 180.0/np.pi
                azim = np.arctan2(corr_y, corr_x) * 180.0/np.pi

                if i == 8:
                    force = 0.97
                    elev = 55.0
                    azim = 260.0

                data = {}
                tmp_data = (nodes_values[7].temp_value + nodes_values[5].temp_value)/2.0
                data.update({dataFormatNode[0] : tmp_data})
                tmp_data = (nodes_values[7].moist_value + nodes_values[5].moist_value)/2.0
                data.update({dataFormatNode[1] : val2moist(tmp_data)})
                data.update({dataFormatNode[2] : force})
                data.update({dataFormatNode[3] : elev})
                data.update({dataFormatNode[4] : azim})
                tmp_data = (nodes_values[7].snr_value + nodes_values[5].snr_value)/2.0
                data.update({dataFormatNode[5] : tmp_data})
                tmp_data = (nodes_values[7].rssi_value + nodes_values[5].rssi_value)/2.0
                data.update({dataFormatNode[6] : tmp_data})
                tmp_data = (nodes_values[7].fei_value + nodes_values[5].fei_value)//2.0
                data.update({dataFormatNode[7] : tmp_data})
                tmp_data = (nodes_values[7].flags_value + nodes_values[5].flags_value)/2.0
                data.update({dataFormatNode[8] : tmp_data})  
                data.update({dataFormatNode[9] : nodes_values[7].status_value})
            data_out.update({'node_' + str(i) : data})

        # Interpolate

        old_size_x = 3
        old_size_y = 3

        new_size_x = 30
        new_size_y = 30

        x = []
        y = []
        z = []

        if interp_opt == "MoistureNode":
            for i in range(old_size_x):
                tmpx = []
                tmpy = []
                tmpz = []
                for j in range(old_size_y):
                    tmpx.append((i + 0.5)/old_size_x)
                    tmpy.append((j + 0.5)/old_size_y)
                    tmpz.append(data_out['node_'+str(i*old_size_y + j)]['MoistureNode'])
                x.append(tmpx)
                y.append(tmpy)
                z.append(tmpz)
        elif interp_opt == "SNRNode":
            for i in range(old_size_x):
                tmpx = []
                tmpy = []
                tmpz = []
                for j in range(old_size_y):
                    tmpx.append((i + 0.5)/old_size_x)
                    tmpy.append((j + 0.5)/old_size_y)
                    tmpz.append(data_out['node_'+str(i*old_size_y + j)]['SNRNode'])
                x.append(tmpx)
                y.append(tmpy)
                z.append(tmpz)
        elif interp_opt == "RSSINode":
            for i in range(old_size_x):
                tmpx = []
                tmpy = []
                tmpz = []
                for j in range(old_size_y):
                    tmpx.append((i + 0.5)/old_size_x)
                    tmpy.append((j + 0.5)/old_size_y)
                    tmpz.append(data_out['node_'+str(i*old_size_y + j)]['RSSINode'])
                x.append(tmpx)
                y.append(tmpy)
                z.append(tmpz)
        elif interp_opt == "FEINode":
            for i in range(old_size_x):
                tmpx = []
                tmpy = []
                tmpz = []
                for j in range(old_size_y):
                    tmpx.append((i + 0.5)/old_size_x)
                    tmpy.append((j + 0.5)/old_size_y)
                    tmpz.append(data_out['node_'+str(i*old_size_y + j)]['FEINode'])
                x.append(tmpx)
                y.append(tmpy)
                z.append(tmpz)
        else:
            for i in range(old_size_x):
                tmpx = []
                tmpy = []
                tmpz = []
                for j in range(old_size_y):
                    tmpx.append((i + 0.5)/old_size_x)
                    tmpy.append((j + 0.5)/old_size_y)
                    tmpz.append(data_out['node_'+str(i*old_size_y + j)]['TemperatureNode'])
                x.append(tmpx)
                y.append(tmpy)
                z.append(tmpz)

        xnew, ynew = np.mgrid[0.0:1.0:new_size_x*1j, 0:1:new_size_y*1j]
        #f = interpolate.RectBivariateSpline(x, y, z)
        f = Rbf(x, y, z)
        znew = f(xnew, ynew)

        if interp_opt == "MoistureNode":
            znew = np.clip(znew , 0.0, 100.0)

        data_output = {}

        for i in range(new_size_x):
            for j in range(new_size_y):
                data_output.update({'z_' + str(i*new_size_y + j):znew[i][j]})

        data_out.update({'map_data' : data_output})

    elif map_opt == 'Serie':

        data_out = {}
        data = {}

        data_time =  Datafield.objects.latest('id')
        nodes_values = list(Nodedata.objects.filter(updatetime_value_id=end_n))

        for i in range(len(dataFormatNode)):
            data.update({i : dataFormatNode[i]})
        data_out.update({'strings' : data})

        data_out.update({'nodes_length' : len(nodes_values)})

        for i in range(len(nodes_values)):
            data = {}
            node_vals = vars(nodes_values[i])
            acc_x = node_vals['acc_x_value']
            acc_y = node_vals['acc_y_value']
            acc_z = node_vals['acc_z_value']

            corr_x = acc_z
            corr_y = acc_x/np.sqrt(2.0) - acc_y/np.sqrt(2.0)
            corr_z = acc_x/np.sqrt(2.0) + acc_y/np.sqrt(2.0)

            force = np.sqrt(np.power(corr_x, 2) + np.power(corr_y, 2) + np.power(corr_z, 2))
            elev = 180.0 - np.arccos(corr_z/force) * 180.0/np.pi
            azim = np.arctan2(corr_y, corr_x) * 180.0/np.pi

            temp_value = val2temp(node_vals['temp_value'])
            data.update({dataFormatNode[0] : temp_value})
            data.update({dataFormatNode[1] : val2moist(moist2cal(node_vals['moist_value'], temp_value))})
            data.update({dataFormatNode[2] : force})
            data.update({dataFormatNode[3] : elev})
            data.update({dataFormatNode[4] : azim})
            data.update({dataFormatNode[5] : node_vals['snr_value']})
            data.update({dataFormatNode[6] : node_vals['rssi_value']})
            data.update({dataFormatNode[7] : node_vals['fei_value']})
            data.update({dataFormatNode[8] : node_vals['flags_value']})
            data.update({dataFormatNode[9] : node_vals['status_value']})
            data_out.update({'node_' + str(i) : data})

        if interp_opt == 'MoistureNode':
            nodes_values = list(Nodedata.objects.values('datatime', dataFormatBase[interp_opt], 'temp_value').filter(updatetime_value_id__gte=begin_n, updatetime_value_id__lte=end_n, address_value_id=str(int(node_opt)+1)))
        else:
            nodes_values = list(Nodedata.objects.values('datatime', dataFormatBase[interp_opt]).filter(updatetime_value_id__gte=begin_n, updatetime_value_id__lte=end_n, address_value_id=str(int(node_opt)+1)))

        data = []
        for i in range(len(nodes_values)):
            save_value = nodes_values[i][dataFormatBase[interp_opt]]
            if interp_opt == 'MoistureNode':
                tmp_value = nodes_values[i]['temp_value']
                if temp2disc(tmp_value) < 0:
                    tmp_value = nodes_values[i-1]['temp_value']
                tmp_value = val2temp(tmp_value)
                save_value = moist2cal(save_value, tmp_value)
                save_value = val2moist(save_value)
            elif interp_opt == 'TemperatureNode':
                if (-10.888)**2 + 4*0.00347*(1777.3 - save_value*1000) < 0:
                    save_value = nodes_values[i-1][dataFormatBase[interp_opt]]
                save_value = val2temp(save_value)
            
            data.append({'date' : nodes_values[i]['datatime'] - datetime.timedelta(hours=3),
                         'value' : save_value
                        })
        data_out.update({'time_data' : data})

    return JsonResponse(data_out, safe=False)
