import json

with open("data.json", "r") as file:
    data = json.load(file)


rows = []

# Must be greater than or equal to 5
cell_space_allocation = 5


header_footer: str = "Tm".ljust(cell_space_allocation) + "|"

for team_index, team in enumerate(data):

    header_footer += team.center(cell_space_allocation)
    header_footer += "|"

    row: str = ""
    row += team.ljust(cell_space_allocation)
    row += "|"
    for opponent_index, w_l in enumerate(data[team]):
        # Check if row and column have same team
        if opponent_index == team_index:
            row += "--".rjust(cell_space_allocation)
            row += "|"
        wins: str = str(data[team][w_l]["W"])
        row += wins.rjust(cell_space_allocation) + "|"

        # Check if cell is the last row of last column
        if opponent_index == team_index - 1 and team_index == len(data) - 1:
            row += "--".rjust(cell_space_allocation)
            row += "|"

    rows.append(row)

print(header_footer)
for row in rows:
    print(row)
print(header_footer)