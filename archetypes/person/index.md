+++
type = "person"
family = "{{ path.Dir .Dir | path.Dir | path.Base | title }}"
title = "{{ replace (path.Dir .Dir | path.Base ) "_" " " | title }}"
id = "insert number from gramps without the @s"
date = "{{ .Date }}"
author = ""
+++
