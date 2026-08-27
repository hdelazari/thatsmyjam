
load("@rules_shell//shell/toolchains:sh_toolchain.bzl", "sh_toolchain")

sh_toolchain(
    name = "windows_sh",
    path = "",
    launcher = "@bazel_tools//tools/launcher",
    launcher_maker = "@bazel_tools//tools/launcher:launcher_maker",
)


toolchain(
    name = "windows_sh_toolchain",
    toolchain = ":windows_sh",
    toolchain_type = "@rules_shell//shell:toolchain_type",
    target_compatible_with = [
        "@platforms//os:windows",
    ],
)


sh_toolchain(
    name = "linux_sh",
    path = "/bin/bash",
)


toolchain(
    name = "linux_sh_toolchain",
    toolchain = ":linux_sh",
    toolchain_type = "@rules_shell//shell:toolchain_type",
    target_compatible_with = [
        "@platforms//os:linux",
    ],
)


sh_toolchain(
    name = "osx_sh",
    path = "/bin/bash",
)


toolchain(
    name = "osx_sh_toolchain",
    toolchain = ":osx_sh",
    toolchain_type = "@rules_shell//shell:toolchain_type",
    target_compatible_with = [
        "@platforms//os:osx",
    ],
)


sh_toolchain(
    name = "freebsd_sh",
    path = "/usr/local/bin/bash",
)


toolchain(
    name = "freebsd_sh_toolchain",
    toolchain = ":freebsd_sh",
    toolchain_type = "@rules_shell//shell:toolchain_type",
    target_compatible_with = [
        "@platforms//os:freebsd",
    ],
)


sh_toolchain(
    name = "openbsd_sh",
    path = "/usr/local/bin/bash",
)


toolchain(
    name = "openbsd_sh_toolchain",
    toolchain = ":openbsd_sh",
    toolchain_type = "@rules_shell//shell:toolchain_type",
    target_compatible_with = [
        "@platforms//os:openbsd",
    ],
)
