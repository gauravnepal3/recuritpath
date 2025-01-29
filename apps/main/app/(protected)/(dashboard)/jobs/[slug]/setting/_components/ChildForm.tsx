import React from 'react'

const ChildForm = ({ children }: { children: React.ReactElement }) => {
    return (
        <div className='border-l-4 pl-3 mt-3'>
            {children}
        </div>
    )
}

export default ChildForm