+++
type = "family"
title = "{{ replace .ContentBaseName "-" " " | title }}"
date = "{{ .Date }}"
author = ""
surn = "{{ path.Dir .Dir | path.Base | title }}"
[cascade]
  surn = "{{ path.Dir .Dir | path.Base | title }}"
+++
