{{- /*
Helper to determine whether dial services should be deployed.
Priority order:
 1. .Values.dial.deploy_dial_services
 2. .Values.global.dial.deploy_dial_services
 3. .Values.global.deploy_dial_services
 4. .Values.deploy_dial_services (chart-local)

Values can be boolean or string ('true'/'false'); we coerce with `toBool` when present.
The helper returns the string "true" or "false" so it can be used with `include` and `eq`.
*/ -}}
{{- define "dial.deployDialEnabled" -}}
	{{- $ctx := . -}}
	{{- /* 1) check global.deploy_dial_services first (user requested global to be authoritative) */ -}}
	{{- if and (hasKey $ctx.Values "global") (hasKey $ctx.Values.global "deploy_dial_services") -}}
		{{- $v := index $ctx.Values.global "deploy_dial_services" -}}
		{{- if kindIs "string" $v -}}
			{{- $s := lower (trim $v) -}}
			{{- if or (eq $s "true") (eq $s "1") (eq $s "yes") (eq $s "y") (eq $s "on") -}}true{{- else -}}false{{- end -}}
		{{- else -}}
			{{- if $v -}}true{{- else -}}false{{- end -}}
		{{- end -}}
	{{- else -}}
		{{- /* 2) check .Values.dial.deploy_dial_services */ -}}
		{{- if and (hasKey $ctx.Values "dial") (hasKey $ctx.Values.dial "deploy_dial_services") -}}
			{{- $v := index $ctx.Values.dial "deploy_dial_services" -}}
			{{- if kindIs "string" $v -}}
				{{- $s := lower (trim $v) -}}
				{{- if or (eq $s "true") (eq $s "1") (eq $s "yes") (eq $s "y") (eq $s "on") -}}true{{- else -}}false{{- end -}}
			{{- else -}}
				{{- if $v -}}true{{- else -}}false{{- end -}}
			{{- end -}}
		{{- else -}}
			{{- /* 3) check global.dial.deploy_dial_services */ -}}
			{{- if and (hasKey $ctx.Values "global") (hasKey $ctx.Values.global "dial") (hasKey $ctx.Values.global.dial "deploy_dial_services") -}}
				{{- $v := index $ctx.Values.global.dial "deploy_dial_services" -}}
				{{- if kindIs "string" $v -}}
					{{- $s := lower (trim $v) -}}
					{{- if or (eq $s "true") (eq $s "1") (eq $s "yes") (eq $s "y") (eq $s "on") -}}true{{- else -}}false{{- end -}}
				{{- else -}}
					{{- if $v -}}true{{- else -}}false{{- end -}}
				{{- end -}}
			{{- else -}}
				{{- /* 4) fallback to chart-local .Values.deploy_dial_services */ -}}
				{{- if hasKey $ctx.Values "deploy_dial_services" -}}
					{{- $v := index $ctx.Values "deploy_dial_services" -}}
					{{- if kindIs "string" $v -}}
						{{- $s := lower (trim $v) -}}
						{{- if or (eq $s "true") (eq $s "1") (eq $s "yes") (eq $s "y") (eq $s "on") -}}true{{- else -}}false{{- end -}}
					{{- else -}}
						{{- if $v -}}true{{- else -}}false{{- end -}}
					{{- end -}}
				{{- else -}}
					false
				{{- end -}}
			{{- end -}}
		{{- end -}}
	{{- end -}}
{{- end -}}
