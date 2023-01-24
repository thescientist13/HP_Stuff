+++
families = "{{ replace .ContentBaseName "_" " " | title }}"
type = "family"
title = "{{ replace .ContentBaseName "-" " " | title }}"
tags = ["family"]
surn = "{{ path.Dir .Dir | path.Base | title }}"
[cascade]
  surn = "{{ path.Dir .Dir | path.Base | title }}"
+++
