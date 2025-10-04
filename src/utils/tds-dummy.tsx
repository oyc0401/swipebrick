import React from "react";

export const TDSMobileAITProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return React.createElement(React.Fragment, null, children);
};

// 웹 폴백과 100% 동일한 스타일
export const Paragraph = (props: any) => {
  return React.createElement(
    "p",
    {
      style: {
        fontSize: "18px",
        fontWeight: "600",
        color: props.color === "#3182f6" ? "#3182f6" : "#4e5968",
        margin: "0",
        ...props.style,
      },
      ...props,
    },
    props.children
  );
};

Paragraph.Text = (props: any) => {
  return React.createElement(
    "span",
    {
      style: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#4e5968",
        ...props.style,
      },
      ...props,
    },
    props.children
  );
};

export const colors = {
  blue500: "#3182f6",
  grey700: "#4e5968",
  grey600: "#6b7684",
};

export const Button = (props: any) => {
  return React.createElement(
    "button",
    {
      onClick: props.onClick,
      style: {
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: props.variant === "primary" ? "#3182f6" : "#f2f4f6",
        color: props.variant === "primary" ? "white" : "#4e5968",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        ...props.style,
      },
      ...props,
    },
    props.children
  );
};

export const Modal = (props: any) => {
  if (!props.isOpen) return null;

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          margin: "20px",
          maxWidth: "400px",
          width: "100%",
        },
      },
      props.children
    )
  );
};

export const ConfirmDialog = (props: any) => {
  if (!props.open) return null;

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      },
      onClick: props.onClose,
    },
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          margin: "20px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        },
        onClick: (e: any) => e.stopPropagation(),
      },
      [
        React.createElement(React.Fragment, { key: "title" }, props.title),
        React.createElement(
          React.Fragment,
          { key: "description" },
          props.description
        ),
        React.createElement(
          "div",
          {
            key: "buttons",
            style: {
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              justifyContent: "center",
            },
          },
          [
            React.createElement(
              React.Fragment,
              { key: "cancel" },
              props.cancelButton
            ),
            React.createElement(
              React.Fragment,
              { key: "confirm" },
              props.confirmButton
            ),
          ]
        ),
      ]
    )
  );
};

ConfirmDialog.Title = (props: any) => {
  return React.createElement(
    "h2",
    {
      style: {
        fontSize: "20px",
        fontWeight: "600",
        margin: "0 0 16px 0",
        color: "#191f28",
      },
    },
    props.children
  );
};

ConfirmDialog.Description = (props: any) => {
  return React.createElement(
    "p",
    {
      style: {
        fontSize: "16px",
        margin: "0",
        color: "#4e5968",
        lineHeight: "1.5",
      },
    },
    props.children
  );
};

ConfirmDialog.CancelButton = (props: any) => {
  return React.createElement(
    "button",
    {
      onClick: props.onClick,
      style: {
        padding: "12px 24px",
        borderRadius: "8px",
        border: "1px solid #e5e8eb",
        backgroundColor: "white",
        color: "#4e5968",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        flex: 1,
      },
    },
    props.children
  );
};

ConfirmDialog.ConfirmButton = (props: any) => {
  return React.createElement(
    "button",
    {
      onClick: props.onClick,
      style: {
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#3182f6",
        color: "white",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        flex: 1,
      },
    },
    props.children
  );
};
