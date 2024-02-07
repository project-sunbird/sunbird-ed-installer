## Prerequisite

1. helm version > 3.12

  ```
  ❯ helm version                                                                                  
    version.BuildInfo{Version:"v3.12.2", GitCommit:"v3.12.2", GitTreeState:"", GoVersion:"go1.20.8"}
  ```

## Create a helm chart

1. Add base chart repo

```
helm repo add nimbushub https://nimbushubin.github.io/helmcharts/ 
```

2. Download the base chart

```
cd building-block/charts/
helm repo update nimbushub
helm fetch --untar nimbushub/base -d .

```

3. Create module chart

```
Replace `name: base` with the `name: module` name in base/Chart.yaml
Add correct application version of the module in `appVersion: <module version>`
mv base <module name>
```
Note: You **don't have to update anything in the templates/ directory**. All the configurations can be directly added to values.yaml, along with configuration files in configs/ folder


## Testing a helm chart

1. Download all dependencies prior testing, `helm dependency update ./<knowledgebb or any other building block umberlla chart>`

2. While developing for syntax, correctness, you can always use `helm template test ./<chart-name>`
