import { Box } from "@mui/material";

const CalendarDay = ({ children, ...props }) => (
  <Box minHeight={135} bgcolor="white"  borderBottom={'1px solid lightgrey'} {...props}>
    {children}
  </Box>
);

export default CalendarDay;
