{{/* Define findkey function */}}
{{- define "common.variables.findkey" -}}
{{- $value := .value -}}
{{- $keys := .keys -}}
{{- $found := true -}}

{{- range $key := $keys -}}
  {{- if kindIs "map" $value -}}
    {{- if hasKey $value $key -}}
      {{- $value = index $value $key -}}
    {{- else -}}
      {{- $found = false -}}
      {{- break -}}
    {{- end -}}
  {{- else -}}
    {{- $found = false -}}
    {{- break -}}
  {{- end -}}
{{- end -}}

{{- if $found -}}
  {{- $value -}}
{{- else -}}
  {{- "" -}}
{{- end -}}
{{- end -}}

{{/* Define getmethekey function with precedence and input as a dot-delimited string using findkey */}}
{{- define "common.variables.variableGlobal" -}}
{{- $root := first . -}}
{{- $keyString := index (rest .) 0 -}}
{{- $keys := splitList "." $keyString -}}

{{- $value := include "common.variables.findkey" (dict "value" $root.Values "keys" $keys) -}}

{{- if (not $value) -}}
  {{- $value = include "common.variables.findkey" (dict "value" $root.Values.global "keys" $keys) -}}
{{- end -}}

{{- $value -}}
{{- end -}}
