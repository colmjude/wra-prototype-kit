# only accepts 6 char hex values
def hex_to_rgb_string_filter(hex):
    """
    Given hex will return rgb string

    E.g. #0b0c0c ==> "11, 12, 12"
    """
    print(hex)
    h = hex.lstrip("#")
    rgb = tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))
    return f"{rgb[0]},{rgb[1]},{rgb[2]}"


def strip_zero_decimals_filter(v):
    if v.endswith((".0", ".00")):
        parts = v.split(".")
        return parts[0]
    return v
