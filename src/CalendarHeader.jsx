import { Stack, Typography } from "@mui/material";

const CalendarHeader = (props) => {
  const { children, weekend, yearMonthElement, ...others } = props;

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid lightgrey",
      }}
      {...others}
    >
      {yearMonthElement}
      <Stack
        direction="row"
        width="100%"
        p="5px 12px"
        justifyContent="flex-end"
      >
        <Typography>{children}</Typography>
      </Stack>
    </Stack>
  );
};

export default CalendarHeader;
