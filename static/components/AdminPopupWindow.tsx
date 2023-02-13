import styles from "../styles/Home.module.css"
import FaIcon from "./FaIcon"

export default function AdminPopupWindow(options) {
  const {
    title,
    isOpened,
    hasClose,
    onClose,
    children,
  } = {
    hasClose: false,
    onClose: () => {},
    ...options
  }
  if (!isOpened) return null
  
  return (
    <div className={styles.adminPopupWindow}>
      <div>
        <h3>
          {title}
          {hasClose && (
            <a onClick={onClose}>
              <FaIcon icon="close" />
            </a>
          )}
        </h3>
        {children}
      </div>
    </div>
  )
}