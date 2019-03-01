from django.shortcuts import render

# Create your views here.

dataFormatGate = [
    "ConnectionGate",
    "TemperatureGate",
    "MoistureGate",
    "SNRGate",
    "RSSIGate",
    "FEIGate",
    "FlagsGate",
    "StatusGate"]

dataFormatNode = [
    'TemperatureNode',
    'MoistureNode',
    'AccelerationNode',
    'ElevationNode',
    'AzimuthNode',
    'SNRNode',
    'RSSINode',
    'FEINode',
    'FlagsNode',
    'StatusNode']

dataFormatBase = {
    'TemperatureNode':'temp_value',
    'MoistureNode':'moist_value',
    'AccelerationNode':'acc_x_value',
    'ElevationNode':'acc_y_value',
    'AzimuthNode':'acc_z_value',
    'SNRNode':'snr_value',
    'RSSINode':'rssi_value',
    'FEINode':'fei_value',
    'FlagsNode':'flags_value',
    'StatusNode':'status_value'
}