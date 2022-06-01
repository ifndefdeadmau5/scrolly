import { DateTime } from "luxon";
import { Box, Fab, Stack, Typography } from "@mui/material";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { Waypoint } from "react-waypoint";
import chunk from "lodash/chunk";
import CalendarDay from "./CalendarDay";
import CalendarHeaderDS from "./CalendarHeader";

const CalendarHeader = (props) => <CalendarHeaderDS zIndex={1} {...props} />;

function App(props) {
  const {} = props;
  const [days, setDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const startOffsetYRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animatingIndicatorRef = useRef(null);
  const nextElemRef = useRef(null);
  const prevElemRef = useRef(null);
  const directionRef = useRef("down");

  const handleScroll = () => {
    const position = window.pageYOffset;
    if (animatingIndicatorRef.current) {
      animatingIndicatorRef.current.style.background = isAnimatingRef.current
        ? "green"
        : "lightgrey";
      animatingIndicatorRef.current.innerText = `prev: ${
        prevElemRef.current ? prevElemRef.current.id : null
      } \n next: ${nextElemRef.current ? nextElemRef.current.id : null}`;
    }
    const nextStartingPoint = directionRef.current === "down" ? 34 : 4;
    const prevStartingPoint = directionRef.current === "down" ? 4 : -26;
    if (!isAnimatingRef.current) return;
    const difference = startOffsetYRef.current - position;
    // animate
    if (nextElemRef.current) {
      // console.log("next animating...", nextElemRef.current.id);
      nextElemRef.current.style.position = "fixed";
      nextElemRef.current.style.top = `${nextStartingPoint + difference}px`;
    }
    if (prevElemRef.current) {
      // console.log("prev animating...", prevElemRef.current.id);
      prevElemRef.current.style.position = "fixed";
      prevElemRef.current.style.top = `${prevStartingPoint + difference}px`;
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // below useEffect is irrelevant
  useEffect(() => {
    if (days.length) {
      setCurrentMonth(days[0].day);
    }
  }, [days]);

  // below useEffect is irrelevant
  useEffect(() => {
    const getDays = (options = { monthRange: 6 }) => {
      const { monthRange } = options;
      const now = DateTime.now().minus({ weeks: 2 });
      const firstColumnDay = now.startOf("week").get("day");

      const months = [];
      for (let i = 0; i < monthRange; i++) {
        months.push(now.plus({ months: i }));
      }

      return months.flatMap((month, index) => {
        const days = [];
        for (
          let i = index === 0 ? firstColumnDay - 1 : 0;
          i < month.daysInMonth;
          i++
        ) {
          const currentDate = month.startOf("month").plus({ days: i });
          days.push(currentDate);
        }
        return days;
      });
    };

    const calendarDates = getDays();

    const days = calendarDates.map((day) => ({
      id: nanoid(),
      day,
    }));
    setDays(days);
  }, []);

  const months = chunk(days, 7 * 4);

  return (
    <Box display="grid" sx={{ placeItems: "center", position: "relative" }}>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(220px, 1fr))",
          textAlign: "right",
          gridGap: "1px",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <CalendarHeader
        // yearMonthElement={
        //   <Stack ref={floatingDateRef} p="8px 0 2px 16px" direction="row">
        //     <Typography component="span" variant="h5" noWrap>
        //       {currentMonth.get("year")}-{currentMonth.toFormat("MM")}
        //     </Typography>
        //   </Stack>
        // }
        >
          Mon
        </CalendarHeader>
        <CalendarHeader>Tue</CalendarHeader>
        <CalendarHeader>Wed</CalendarHeader>
        <CalendarHeader>Thu</CalendarHeader>
        <CalendarHeader>Fri</CalendarHeader>
        <CalendarHeader weekend>Sat</CalendarHeader>
        <CalendarHeader weekend>Sun</CalendarHeader>
      </Box>
      {months.map((days, i) => {
        return (
          <Box
            key={i}
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(220px, 1fr))",
              textAlign: "right",
              gridGap: "1px",
              position: "relative",
            }}
          >
            {days.map(({ id, day }, i) => {
              const date = day.get("day");
              const isLastSevenDay = date > day.daysInMonth - 7;
              const shouldDisplayMonth = i % 7 === 0 && isLastSevenDay;
              return (
                <CalendarDay key={i}>
                  {shouldDisplayMonth && (
                    <>
                      <Waypoint
                        topOffset={34}
                        onLeave={({ currentPosition }) => {
                          if (currentPosition === "above") {
                            isAnimatingRef.current = true;
                            directionRef.current = "down";
                            startOffsetYRef.current = window.pageYOffset;

                            if (nextElemRef.current) {
                              prevElemRef.current = nextElemRef.current;
                            }
                            nextElemRef.current = document.getElementById(
                              day.plus({ months: 1 }).toFormat("yyyy-MM")
                            );
                            nextElemRef.current.style.top = "34px";
                            nextElemRef.current.style.left = "4px";
                          }
                        }}
                        onEnter={({ currentPosition, previousPosition }) => {
                          if (previousPosition === "above") {
                            // abort during down
                            console.log("abort during down");
                            isAnimatingRef.current = false;
                            nextElemRef.current.style.position = "static";
                            nextElemRef.current = prevElemRef.current;
                            prevElemRef.current = document.getElementById(
                              day.minus({ months: 1 }).toFormat("yyyy-MM")
                            );
                          }
                        }}
                      />
                      <Waypoint
                        topOffset={0}
                        onLeave={({ currentPosition }) => {
                          if (currentPosition === "above") {
                            isAnimatingRef.current = false;
                          }
                        }}
                        onEnter={({ currentPosition, previousPosition }) => {
                          if (previousPosition === "above") {
                            isAnimatingRef.current = true;
                            startOffsetYRef.current = window.pageYOffset;
                            directionRef.current = "up";
                          }
                        }}
                      />
                    </>
                  )}

                  <Stack
                    direction="row"
                    justifyContent={"space-between"}
                    alignItems="center"
                    p="4px 12px 2px 4px"
                  >
                    {shouldDisplayMonth ? (
                      <Box
                        id={day.plus({ months: 1 }).toFormat("yyyy-MM")}
                        sx={{
                          zIndex: 2,
                          position: "sticky",
                          top: "0px",
                          left: "0px",
                        }}
                      >
                        <Typography
                          color="text.tertiary"
                          component="span"
                          variant="h5"
                        >
                          {day.plus({ months: 1 }).toFormat("yyyy")}-
                        </Typography>
                        <Typography component="span" variant="h5">
                          {day.plus({ months: 1 }).toFormat("MM")}
                        </Typography>
                      </Box>
                    ) : (
                      <span />
                    )}
                    <Typography variant="subtitle4_M">{date}</Typography>
                  </Stack>
                </CalendarDay>
              );
            })}
          </Box>
        );
      })}
      <Fab
        ref={animatingIndicatorRef}
        sx={{ position: "fixed", right: 0, top: 0, width: 100, height: 100 }}
      >
        Loading
      </Fab>
    </Box>
  );
}

export default App;
