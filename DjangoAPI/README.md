### Code Explanation

My algorithm iterates through the wins each team has against other teams using a nested loop to access the key-value
pairs, appending each win value sequentially to a string, where each row represents one team's wins against all other
teams. The string for each row then is stored in a list (array). Notably, it ignores the loss values provided since 
Team A's win against Team B is equivalent to Team B's loss to Team A.

To keep track of when a cell's column and row are for the same team, both for loops are enumerated to keep track of when
both indices are the same so the placeholder `--` can be used instead. Since there are fewer keys inside the
nested JSON objects compared to the root object, the rightmost cell in the bottom row must also have a placeholder added
to it since the loop will never reach it otherwise (A team cannot play itself, so each team will have at least one fewer
number of opponents than there are total teams).

My code uses the Python String built-in justify and center methods when appending all values to the strings to ensure 
consistent formatting for every cell in order to maximize the output's readability.

The data is displayed by first printing the header/footer string. Each row is then printed sequentially, followed the
header/footer string again to produce the output.

**My code relies on the following assumptions of the data:** 

- The JSON is stored in a `file` with double quotes around keys, not single quotes
- The order in which opponents are listed for a given team must be in the same order as teams are provided in the
root
- The longest identifying tricode for a team must not be longer than the size of cell_space_allocation (In this case,
all tricodes are 3 characters long)