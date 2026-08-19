export const userTableConfig = {
  locale: "en-IN",

  columns: [
    {
      key: "pic",
      label: "",
      cell: "ProfilePic",
      hideHeader: true,
      enableSorting: false,
      width: "40px",
    },
    {
      key: "name",
      label: "Name",
      cell: "NameCell",
      sortValue: ["first_name", "last_name"],
    },
    {
      key: "position",
      label: "Position",
    },
    {
      key: "office",
      label: "Office",
    },
    {
      key: "age",
      label: "Age",
      align: "right",
    },
    {
      key: "rating",
      label: "Employee Rating",
      cell: "RatingCell",
      max: 10,
    },
    {
      key: "salary",
      label: "Salary",
      align: "right",
      cell: "MoneyCell",
      currency: "USD",
    },
    {
      key: "start_date",
      label: "Start Date",
      cell: "DateCell",
    },
  ],
};

export const userTableFilters = [
  {
    key: "office",
    label: "Location",
    type: "checkbox",
    showCount: true,
    sort: "alphabetical",
  },
  {
    key: "age",
    label: "Age",
    type: "range",
  },
  {
    key: "salary",
    label: "Salary",
    type: "range",
  },
  {
    key: "start_date",
    label: "Start Date",
    type: "range",
    valueType: "date",
  },
];
