import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "interface.settings")
import django
django.setup()

from processing.models import Datafield, Nodeaddress, Nodedata
import struct

if __name__ == '__main__':

    for i in range(9):
        tmp_addr = 0x23 + 0x10*i
        addr = [0xAA, 0x55, tmp_addr, 0x5A]
        addr_int = struct.unpack('i', bytes(addr))[0]
        freq = 432970000.0
        if i == 1:
            freq  = 432950000.0
        elif i == 6:
            freq  = 432910000.0
        elif i == 7:
            freq  = 432950000.0

        new_node, created  = Nodeaddress.objects.update_or_create(node_address=addr_int, defaults={'node_frequency': freq})
        new_node.save()
