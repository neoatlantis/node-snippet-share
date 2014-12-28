#!/usr/bin/python

import os
import sys
import subprocess

if len(sys.argv) < 3:
    print "Usage: python upload.py <URL> <FILENAME>"
    exit(1)

url = sys.argv[1]
if not url.endswith('/'):
    url += '/'

target = sys.argv[2]
if not os.path.isfile(target):
    print "Not a file."
    exit(2)

sha1sum = subprocess.check_output(['sha1sum', target]).strip()[0:40]

hashcash = subprocess.check_output(\
    ['hashcash', '-z', '12', '-mb', '23', sha1sum]
).strip()


print subprocess.check_output(\
    [\
        'curl',
        '-i',
        '-X', 'POST',
        url + hashcash,
        '--data-binary', '@%s' % target
    ]
)
