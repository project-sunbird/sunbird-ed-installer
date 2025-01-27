package common

import input.attributes.request.http as http_request
import future.keywords.in

ROLES := {
   "BOOK_REVIEWER": ["createLock", "publishContent", "listLock", "retireLock", "refreshLock", "rejectContent", "rejectContentV2"],

   "CONTENT_REVIEWER": ["createLock", "publishContent", "listLock", "retireLock", "refreshLock", "rejectContent", "rejectContentV2"],

   "FLAG_REVIEWER": ["publishContent", "rejectContent", "rejectContentV2"],

   "BOOK_CREATOR": ["copyContent", "createContent", "createLock", "updateCollaborators", "collectionImport", "collectionExport", "submitContentForReviewV1", "submitContentForReviewV3", "createAsset", "uploadAsset", "updateAsset", "uploadUrlAsset", "copyAsset", "listLock", "retireLock", "refreshLock", "updateContent", "uploadContent"],

   "CONTENT_CREATOR": ["updateBatch", "copyContent", "createContent", "createLock", "updateCollaborators", "collectionImport", "collectionExport", "submitContentForReviewV1", "submitContentForReviewV3", "submitDataExhaustRequest", "getDataExhaustRequest", "listDataExhaustRequest", "createAsset", "uploadAsset", "updateAsset", "uploadUrlAsset", "copyAsset", "listLock", "retireLock", "refreshLock", "updateContent", "uploadContent", "courseBatchAddCertificateTemplate", "courseBatchRemoveCertificateTemplate", "createBatch"],

   "COURSE_CREATOR": ["updateBatch", "copyContent", "createContent", "createLock", "updateCollaborators", "collectionImport", "collectionExport", "submitContentForReviewV1", "submitContentForReviewV3", "createAsset", "uploadAsset", "updateAsset", "uploadUrlAsset", "copyAsset", "listLock", "retireLock", "refreshLock",  "updateContent", "uploadContent", "courseBatchAddCertificateTemplate", "courseBatchRemoveCertificateTemplate", "createBatch"],

   "COURSE_MENTOR": ["updateBatch", "submitDataExhaustRequest", "getDataExhaustRequest", "listDataExhaustRequest", "courseBatchAddCertificateTemplate", "courseBatchRemoveCertificateTemplate", "createBatch"],

   "PROGRAM_MANAGER": ["submitDataExhaustRequest", "getDataExhaustRequest", "listDataExhaustRequest"],

   "PROGRAM_DESIGNER": ["submitDataExhaustRequest", "getDataExhaustRequest", "listDataExhaustRequest"],

   "ORG_ADMIN": ["acceptTnc", "assignRole", "submitDataExhaustRequest", "getDataExhaustRequest", "listDataExhaustRequest", "getUserProfileV5", "updateUserV2", "readUserConsent", "createTenantPreferences", "updateTenantPreferences", "createReport", "deleteReport", "updateReport", "publishReport", "retireReport", "getReportSummary", "listReportSummary", "createReportSummary"],

   "REPORT_VIEWER": ["acceptTnc", "getReportSummary", "listReportSummary"],

   "REPORT_ADMIN": ["submitDataExhaustRequest", "getDataExhaustRequest", "listDataExhaustRequest", "acceptTnc", "createReport", "deleteReport", "updateReport", "publishReport", "retireReport", "getReportSummary", "listReportSummary", "createReportSummary"],

   "PUBLIC": ["PUBLIC"]
}

x_authenticated_user_token := http_request.headers["x-authenticated-user-token"]
x_authenticated_for := http_request.headers["x-authenticated-for"]
private_ingressgateway_ip := "{{ .Values.global.private_ingressgateway_ip }}"

jwt_public_keys := {
{{- range $key, $value := .Values.global.access_v1_public_keys }}
"{{ $key }}": "{{ $value | replace "\n" "\\n" }}",
{{- end }}
"KEYCLOAK_KID": "KEYCLOAK_PUBLIC_KEY"
}

user_token := {"header": header, "payload": payload} {
  encoded := x_authenticated_user_token
  [header, payload, _] := io.jwt.decode(encoded)
}

for_token := {"payload": payload} {
  encoded := x_authenticated_for
  [_, payload, _] := io.jwt.decode(encoded)
}

iss := "https://{{ .Values.global.domain }}/auth/realms/{{ .Values.keycloak_realm | default "sunbird" }}"
token_kid := user_token.header.kid
token_iss := user_token.payload.iss
token_exp := user_token.payload.exp
current_time := time.now_ns()

token_sub := split(user_token.payload.sub, ":")
# Check for both cases - With and without federation_id in sub field as below
# sub := f:federation_id:user_id OR sub := user_id
token_userid = token_sub[2] {
    count(token_sub) == 3
} else = token_sub[0] {
    count(token_sub) == 1
}
for_token_userid := for_token.payload.sub
for_token_parentid := for_token.payload.parentId

# Desktop app is still using keycloak tokens which will not have roles
# This is a temporary fix where we will append the roles as PUBLIC in OPA

default_role := [{"role": "PUBLIC", "scope": []}]

token_roles = user_token.payload.roles {
    user_token.payload.roles
} else = default_role {
    not user_token.payload.roles
}

for_token_exists {
  x_authenticated_for
  count(x_authenticated_for) > 0
}

userid = token_userid {
    not x_authenticated_for
} else = token_userid {
    count(x_authenticated_for) == 0 # This is a temporary fix as the mobile app is sending empty headers as x-authenticated-for: ""
} else = for_token_userid {
    for_token_exists
}

validate_token {
  io.jwt.verify_rs256(x_authenticated_user_token, jwt_public_keys[token_kid])
  token_exp * 1000000000 > current_time
  token_iss == iss
}

is_an_internal_request {
  http_request.host == private_ingressgateway_ip
}

acls_check(acls) = indicies {
  validate_token
  indicies := [idx | some i; ROLES[token_roles[i].role][_] == acls[_]; idx := i]
  count(indicies) > 0
}

role_check(roles) = indicies {
  indicies := [idx | some i; token_roles[i].role in roles; idx := i]
  count(indicies) > 0
}

org_check(roles) = token_organisationids {
  indicies :=  role_check(roles)
  count(indicies) > 0
  token_organisationids := [ids | ids := token_roles[indicies[_]].scope[_].organisationId]
  count(token_organisationids) > 0
}

parent_id_check {
    x_authenticated_for
    count(x_authenticated_for) > 0
    token_userid == for_token_parentid
}

parent_id_check {
    count(x_authenticated_for) == 0
}

parent_id_check {
    not x_authenticated_for
}

public_role_check {
  acls := ["PUBLIC"]
  roles := ["PUBLIC"]
  acls_check(acls)
  role_check(roles)
  userid
  parent_id_check
}