
import { DataGrid } from '@mui/x-data-grid';

import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import { getAllProperties } from '../../services/propertyService';
import type { Property } from '../../types/Property';
import type { Lang } from '../../utils/storage';
import { getLanguage } from '../../utils/storage';


const columns = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "price", headerName: "Price", width: 140 },
    { field: "address", headerName: "Address", width: 400 },
    {
        field: "status", headerName: "Status", width: 120
    },
    {
        field: "action", headerName: "Action", width: 200
    }
];



const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable() {

    const [rows, setRows] = useState<Property[]>();
    const [loading, setLoading] = useState(true);
    const [filterRow, setFilterRow] = useState<Property[]>();
    const [searchText, setSearchText] = useState("");
    const currentLanguage: Lang = getLanguage();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllProperties();
                console.log(data)
                setRows(data);
            } catch (error) {
                console.log("Cannot fetch users", error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        const filtered = rows?.filter((r) =>
            r.title[currentLanguage].toLowerCase().includes(searchText.toLowerCase()) ||
            r.address[currentLanguage].toLowerCase().includes(searchText.toLowerCase()) ||
            r.price.toString().toLowerCase().includes(searchText.toLowerCase())
        );
        setFilterRow(filtered);
    }, [searchText, rows]);

    if (rows == null) return <p>Is loading </p>
    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            <h1 className='text-center pr-30 pb-7'>List All Properties</h1>
            <div className="pb-4 ">
                <input
                    type="text"
                    placeholder="Search by title or price or address..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border rounded px-3 py-1 w-1/3"
                />
            </div>

            <DataGrid
                rows={filterRow ?? rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]} 
                sx={{ border: 0 }}
            />
        </Paper>
    );
}