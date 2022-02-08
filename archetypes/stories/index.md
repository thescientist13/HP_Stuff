---
title: "{{ .Name | humanize | title }}"
date: {{ .Date }}
weight: 1
bookComments: false
bookSearchExclude: true
# bookHidden: false
# bookToc: true
---

{{ define "main" }}
  {{ range sort .Paginator.Pages }}
  <article class="markdown book-post">
    <h2>
      <a href="{{ .RelPermalink }}">{{ partial "docs/title.html" . }}</a>
    </h2>
    {{ partial "docs/post-meta" . }}
    <p>
      {{- .Summary -}}
      {{ if .Truncated }}
        <a href="{{ .RelPermalink }}">...</a>
      {{ end }}
    </p>
  </article>
  {{ end }}

  {{ template "_internal/pagination.html" . }}
{{ end }}

{{ define "toc" }}
  {{ partial "docs/taxonomy" . }}
{{ end }}
