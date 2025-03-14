# .Values.namespace will get overridden by .Values.global.namespace.chart-name
{{- define "base.namespace" -}}
  {{- $chartName := .Chart.Name }}
  {{- $namespace := default .Release.Namespace .Values.namespace }}
  {{- if .Values.global }}
  {{- with .Values.global.namespace }}
    {{- if hasKey . $chartName }}
      {{- $namespace = index . $chartName }}
    {{- end }}
  {{- end }}
  {{- end }}
  {{- $namespace | trunc 63 | trimSuffix "-" }}
{{- end }}

