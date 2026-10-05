import './Button.css'

const Button = ({
                    children,
                    type = 'button',
                    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
                    size = 'md',          // 'sm' | 'md' | 'lg'
                    fullWidth = false,
                    disabled = false,
                    isLoading = false,
                    icon: Icon,
                    onClick,
                    className = '',
                    ...props
}) => {
    const classNames = [
        'custom-btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        className,
    ].filter(Boolean).join(' ');
    return (
        <button
            type={type}
            className={classNames}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="btn-spinner" />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && <Icon className="btn-icon" />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;