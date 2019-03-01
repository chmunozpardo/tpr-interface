from django.db import models
from datetime import datetime

# Create your models here.
class Datafield(models.Model):
    update_time = models.DateTimeField()

class Nodeaddress(models.Model):
    node_address = models.IntegerField()
    node_frequency = models.FloatField()

class Nodedata(models.Model):
    moist_value = models.FloatField()
    temp_value = models.FloatField()
    acc_x_value = models.FloatField(default=0.0)
    acc_y_value = models.FloatField(default=0.0)
    acc_z_value = models.FloatField(default=0.0)
    rssi_value = models.FloatField()
    fei_value = models.FloatField()
    snr_value = models.FloatField()
    flags_value = models.FloatField()
    status_value = models.CharField(max_length=100)
    datatime = models.DateTimeField()
    address_value = models.ForeignKey(Nodeaddress, on_delete=models.CASCADE, null=True)
    updatetime_value = models.ForeignKey(Datafield, on_delete=models.CASCADE, null=True)

