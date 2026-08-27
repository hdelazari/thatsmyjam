load("@io_bazel_rules_go//go:def.bzl", "go_binary", "go_library")

go_library(
    name = "backend_lib",
    srcs = ["main.go"],
    importpath = "github.com/thats_my_jam/backend",
)

go_binary(
    name = "backend",
    embed = [":backend_lib"],
    visibility = ["//visibility:public"],
)
