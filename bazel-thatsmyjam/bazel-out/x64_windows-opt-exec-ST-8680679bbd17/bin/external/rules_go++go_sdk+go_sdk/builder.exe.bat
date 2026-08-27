@echo off
set GOMAXPROCS=1
set GOCACHE=%cd%\bazel-out\x64_windows-opt-exec-ST-8680679bbd17\bin\external\rules_go++go_sdk+go_sdk\gotmp\gocache
set GOPATH=%cd%"\bazel-out\x64_windows-opt-exec-ST-8680679bbd17\bin\external\rules_go++go_sdk+go_sdk\gotmp\gopath
set GOTOOLCHAIN=local
set GO111MODULE=off
set GOTELEMETRY=off
set GOENV=off
external\rules_go++go_sdk+go_sdk\bin\go.exe build -trimpath -ldflags "-buildid='' -X main.rulesGoStdlibPrefix=@@rules_go+//stdlib:" -o bazel-out/x64_windows-opt-exec-ST-8680679bbd17/bin/external/rules_go++go_sdk+go_sdk/pack.exe cmd/pack
if %ERRORLEVEL% EQU 0 (
  external\rules_go++go_sdk+go_sdk\bin\go.exe build -trimpath -ldflags "-buildid='' -X main.rulesGoStdlibPrefix=@@rules_go+//stdlib:" -o bazel-out/x64_windows-opt-exec-ST-8680679bbd17/bin/external/rules_go++go_sdk+go_sdk/builder.exe external/rules_go+/go/tools/builders/ar.go external/rules_go+/go/tools/builders/asm.go external/rules_go+/go/tools/builders/builder.go external/rules_go+/go/tools/builders/buildinfo.go external/rules_go+/go/tools/builders/cc.go external/rules_go+/go/tools/builders/cgo2.go external/rules_go+/go/tools/builders/cgo_response.go external/rules_go+/go/tools/builders/compilepkg.go external/rules_go+/go/tools/builders/constants.go external/rules_go+/go/tools/builders/cover.go external/rules_go+/go/tools/builders/edit.go external/rules_go+/go/tools/builders/embedcfg.go external/rules_go+/go/tools/builders/env.go external/rules_go+/go/tools/builders/filter.go external/rules_go+/go/tools/builders/filter_buildid.go external/rules_go+/go/tools/builders/flags.go external/rules_go+/go/tools/builders/generate_nogo_main.go external/rules_go+/go/tools/builders/generate_test_main.go external/rules_go+/go/tools/builders/importcfg.go external/rules_go+/go/tools/builders/link.go external/rules_go+/go/tools/builders/nogo.go external/rules_go+/go/tools/builders/nogo_validation.go external/rules_go+/go/tools/builders/read.go external/rules_go+/go/tools/builders/replicate.go external/rules_go+/go/tools/builders/stdlib.go external/rules_go+/go/tools/builders/stdliblist.go external/rules_go+/go/tools/builders/path_windows.go
)
set GO_EXIT_CODE=%ERRORLEVEL%
RMDIR /S /Q "bazel-out\x64_windows-opt-exec-ST-8680679bbd17\bin\external\rules_go++go_sdk+go_sdk\gotmp"
MKDIR "bazel-out\x64_windows-opt-exec-ST-8680679bbd17\bin\external\rules_go++go_sdk+go_sdk\gotmp"
exit /b %GO_EXIT_CODE%
