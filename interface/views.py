from django.http import HttpResponse
from django.template.loader import get_template

from html_templates.views import *

import datetime

def index(request):

    t = get_template('index.html')
    html = t.render({
        'dataFormatGate': dataFormatGate,
        'dataFormatNode': dataFormatNode,
        'range': range(9)
        })
    return HttpResponse(html)