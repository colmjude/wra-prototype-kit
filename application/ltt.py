basic_schedule = [
    {"lower": 0, "upper": 180000, "rate": 0},
    {"lower": 180000, "upper": 1250000, "rate": 3.5},
    {"lower": 250000, "upper": 400000, "rate": 5},
    {"lower": 400000, "upper": 750000, "rate": 7.5},
    {"lower": 750000, "upper": 1500000, "rate": 10},
    {"lower": 1500000, "upper": None, "rate": 12},
]


def to_percent(v):
    return v / 100


def calculate_basic_ltt(value):
    tax = 0
    for band in basic_schedule:
        if band["upper"] is not None and value > band["upper"]:
            full_band = band["upper"] - band["lower"]
            tax += round(full_band * float(to_percent(band["rate"])), 2)
        elif value > band["lower"]:
            value_in_band = value - band["lower"]
            tax += round(value_in_band * float(to_percent(band["rate"])), 2)

    return tax
